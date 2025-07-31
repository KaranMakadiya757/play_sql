import db from "../Utils/dbHelpers.js";
import { pool } from "../DB/index.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js"

// Get Comment for a video
const getVideoComments = asyncHandler(async (req, res) => {

    // Fetch Page and Limit from request params
    // const { page = 1, limit = 10 } = req.query;

    // // Configure Pagination
    // const option = {
    //     page,
    //     limit,
    //     customLabels: {
    //         docs: "comments",
    //         totalDocs: 'totalComments',
    //     }
    // }

    // create aggreagation pipeline for comments
    const [comments] = await pool.query(
        `
        SELECT 
            c.id,
            c.content,
            COUNT(l.id) AS likes,
            c.created_at,
            c.updated_at
        FROM 
            comments c
        LEFT JOIN 
            likes l ON c.id = l.comment
        WHERE 
            c.owner = ?
            AND c.video = ?
        GROUP BY 
            c.id, c.content, c.created_at, c.updated_at
        `,
        [req.user.id, req.video.id]
    );


    // Apply pagination to the comments and fetch from database
    // const comments = await Comment.aggregatePaginate(aggregatedComments, option);

    // Throw error if comments are not found
    if (!comments) throw new ApiError(500, "server error");

    // return response
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched sucessfully"));

})

// Add comment
const addComment = asyncHandler(async (req, res) => {

    // Set Video id in request body
    req.body.video = req.video.id

    // Set owner id in request body
    req.body.owner = req.user.id

    // Create comment 
    const createdComment = await db.create("comments", req.body);

    // Throw Error is comment is not created
    if (!createdComment) {
        throw new ApiError(500, "Internal Server Error !!!");
    }

    // Return response  
    return res
        .status(200)
        .json(new ApiResponse(200, createdComment, "Comment added successfully"));
})

// Update Comment
const updateComment = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.comment.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Comment !!!");
    }

    // Find the Comment by ID and Update
    const updatedComment = await db.update(
        "comments",
        req.comment._id,
        req.body
    );

    // Throw error is something goes wrong while updating comment
    if (!updatedComment) {
        throw new ApiError(500, "Internal Server Error !!!");
    }

    // Return Response
    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
})

// Delete Comment
const deleteComment = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.comment.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Comment !!!");
    }

    // Delete Comment
    const deletedComment = await db.delete("comments", req.comment.id)

    // Throw error is something goes wrong while deleting comment
    if (!deletedComment) {
        throw new ApiError(500, "Internal Server Error !!!");
    }

    // Return response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}