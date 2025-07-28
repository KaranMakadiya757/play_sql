import db from "../Utils/dbHelpers.js";
import { pool } from "../DB/index.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

// Get all user tweets
const getUserTweets = asyncHandler(async (req, res) => {

    // create aggreagation pipeline for comments
    const [tweets] = await pool.query(
        `
        SELECT 
            t.*,
            COUNT(l.id) AS likes
        FROM 
            tweets t
        LEFT JOIN 
            likes l ON t.id = l.tweet
        WHERE 
            t.owner = ?
        GROUP BY 
            t.id
        `,
        [req.user._id]
    );


    // Throw error if comments are not found
    if (!tweets) throw new ApiError(500, "Internal server error");

    // return response
    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched sucessfully"));
})

// Create Tweet
const createTweet = asyncHandler(async (req, res) => {

    // Set owner id in request body
    req.body.owner = req.user.id

    // Create tweet 
    const createdTweet = await db.create("tweets", req.body);

    // Throw Error is comment is not created
    if (!createdTweet) {
        throw new ApiError(500, "Internal Server Error !!!");
    }

    // Return response  
    return res
        .status(200)
        .json(new ApiResponse(200, createdTweet, "Tweet added successfully"));
})

// Update Tweet
const updateTweet = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.tweet.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Tweet !!!");
    }

    // Find the Tweet by ID and Update
    const updatedTweet = await db.update(
        "tweets",
        req.tweet.id,
        req.body
    );

    // Throw error is something goes wrong while updating tweet
    if (!updatedTweet) {
        throw new ApiError(500, "Internal Server Error !!!");
    }

    // Return Response
    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
})

// Delete Tweet
const deleteTweet = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.tweet.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Tweet !!!");
    }

    // Delete Comment
    const deletedTweet = await db.delete("tweets", req.tweet.id)

    // Throw error is something goes wrong while deleting comment
    if (!deletedTweet) {
        throw new ApiError(500, "Internal Server Error !!!");
    }

    // Return response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}