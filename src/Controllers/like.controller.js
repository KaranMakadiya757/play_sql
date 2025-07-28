import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/apiError.js"
import { ApiResponse } from "../Utils/apiResponse.js"
import db from "../Utils/dbHelpers.js"
import { pool } from "../DB/index.js";


const getLikedVideos = asyncHandler(async (req, res) => {

    // Get liked videos
    const [likedVideos] = await pool.query(
        `
        SELECT 
                'id', v.id,
                'title', v.title,
                'thumbnail', v.thumbnail,
                'owner', JSON_OBJECT(
                    'id', u.id,
                    'username', u.username,
                    'avatar', u.avatar
                ) AS owner
        FROM 
            likes l
        JOIN 
            videos v ON l.video = v.id
        JOIN 
            users u ON v.owner = u.id
        WHERE 
            l.liked_by = ?
        `,
        [req.user.id]
    );

    // Throw Error is we get error while fetching liked videos
    if (!likedVideos) {
        throw new ApiError(500, "Internal Server Error !!!");
    }

    // Return respone
    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Videos Fetched SuccessFully"));
})

const toggleVideoLike = asyncHandler(async (req, res) => {

    // Create a Like object
    const likeobj = {
        liked_by: req.user.id,
        video: req.video.id
    }

    // Check Wheather the like is added or not
    const like = await db.findOne("likes", likeobj);

    // Toggle the like
    if (!like) {

        // Add Like
        const newLike = await db.create("likes", likeobj);

        // Throw error 
        if (!newLike) throw new ApiError(500, "Something went wrong while adding like");

        // Return response
        return res
            .status(201)
            .json(new ApiResponse(200, {}, "Added like to video"))

    } else {

        // remove the subscription
        const removedLike = await db.delete("likes", like.id);

        // Throw Error
        if (!removedLike) throw new ApiError(500, "Something went wrong while removing like");

        // Return Response
        return res
            .status(201)
            .json(new ApiResponse(200, {}, "Like removed from video"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {

    // Create a Like object
    const likeobj = {
        liked_by: req.user.id,
        comment: req.comment.id
    }

    // Check Wheather the like is added or not
    const like = await db.findOne("likes", likeobj);

    // Toggle the like
    if (!like) {

        // Add Like
        const newLike = await db.create("likes", likeobj);

        // Throw error 
        if (!newLike) throw new ApiError(500, "Something went wrong while adding like");

        // Return response
        return res
            .status(201)
            .json(new ApiResponse(200, {}, "Added like to comment"))

    } else {

        // remove the subscription
        const removedLike = await db.delete("likes", like.id);

        // Throw Error
        if (!removedLike) throw new ApiError(500, "Something went wrong while removing like");

        // Return Response
        return res
            .status(201)
            .json(new ApiResponse(200, {}, "Like removed from comment"));
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {

    // Create a Like object
    const likeobj = {
        liked_by: req.user.id,
        tweet: req.tweet.id
    }

    // Check Wheather the like is added or not
    const like = await db.findOne("likes", likeobj);

    // Toggle the like
    if (!like) {

        // Add Like
        const newLike = await db.create("likes", likeobj);

        // Throw error 
        if (!newLike) throw new ApiError(500, "Something went wrong while adding like");

        // Return response
        return res
            .status(201)
            .json(new ApiResponse(200, {}, "Added like to tweet"))

    } else {

        // remove the subscription
        const removedLike = await db.delete("likes", like.id);

        // Throw Error
        if (!removedLike) throw new ApiError(500, "Something went wrong while removing like");

        // Return Response
        return res
            .status(201)
            .json(new ApiResponse(200, {}, "Like removed from tweet"));
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}