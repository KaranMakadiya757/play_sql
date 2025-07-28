import db from "../Utils/dbHelpers.js"
import { pool } from "../DB/index.js"
import { ApiError } from "../Utils/apiError.js"
import { ApiResponse } from "../Utils/apiResponse.js"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../Utils/fileOperation.js"

// ADD LIKE COUNT IN GET VIDEOS BY ID
const getAllVideos = asyncHandler(async (req, res) => {
    // Get The search params from the req query
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "title",
        sortType = 1
    } = req.query

    // Configure Pagination
    // const option = {
    //     page,
    //     limit,
    //     customLabels: {
    //         docs: "videos",
    //         totalDocs: 'totalVideos',
    //     }
    // }

    // Throw error if sorting field is not a valid field
    // if (!Video.schema.path(sortBy)) throw new ApiError(400, "Please provide a valid field name for sorting");

    // create pipelie for getting filtered videos
    const [videos] = await pool.query(
        `
        SELECT 
            v.*,
            JSON_OBJECT(
                'id', u.id,
                'username', u.username,
                'avatar', u.avatar
            ) AS owner,
            COUNT(l.id) AS likes
        FROM 
            videos v
        LEFT JOIN 
            users u ON v.owner = u.id
        LEFT JOIN 
            likes l ON v.id = l.video_id
        WHERE 
            v.is_published = true
            AND v.title LIKE CONCAT('%', ?, '%')
        GROUP BY 
            v.id, u.id, u.username, u.avatar
        ORDER BY 
            ${sortBy} ${sortType === "1" ? "ASC" : "DESC"}
        `,
        [query]
    );

    // Apply pagination to the videos and fetch from database
    // const videos = await Video.aggregatePaginate(aggregateVideos, option);

    // Throw error if videos is not found
    if (!videos) throw new ApiError(500, "server error");

    // return response
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched sucessfully"));

})

// Upload a Video
const uploadVideo = asyncHandler(async (req, res) => {
    // Get Video and Thumbnail files local paths
    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    // if any one of them is not uploaded throw error
    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(
            400,
            "Bad Request",
            [!videoLocalPath && "Video file is required", !thumbnailLocalPath && "Thumbnail file is required"].filter(Boolean)
        )
    }

    // Upload video and thumbnail to coludinary
    const video = await uploadOnCloudinary(videoLocalPath, req.user.id);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, req.user.id);

    // Set video url and duration if video is successfully uploaded else throw error
    if (video) {
        req.body.video = video?.public_id;
        req.body.duration = Math.floor(video?.duration ?? 0);
    } else {
        throw new ApiError(500, "Something went wrong while uploading video !!!")
    }

    // Set thumbnail url if thumbnail is successfully uploaded else throw error
    if (thumbnail) {
        req.body.thumbnail = thumbnail?.public_id;
    } else {
        throw new ApiError(500, "Something went wrong while uploading Thumbnail !!!")
    }

    // Set User Id as Owner
    req.body.owner = req.user.id;

    // create video in databse
    const createdvideo = await db.create("videos", req.body)

    // Throw Error if video is not created
    if (!createdvideo) throw new ApiError(500, "server error")

    // return response
    return res
        .status(201)
        .json(new ApiResponse(201, createdvideo, "video uploaded sucessfully"))

})

// Get Video by Id
const getVideoById = asyncHandler(async (req, res) => {

    // apply aggregation pipeline to fetch the video with the user details
    const [videos] = await pool.query(
        `
        SELECT 
            v.*,
            JSON_OBJECT(
                'id', u.id,
                'username', u.username,
                'avatar', u.avatar
            ) AS owner,
            COUNT(l.id) AS likes
        FROM 
            videos v
        LEFT JOIN 
            users u ON v.owner = u.id
        LEFT JOIN 
            likes l ON v.id = l.video_id
        WHERE 
            v.id = ?
        GROUP BY 
            v.id, u.id, u.username, u.avatar
        `,
        [req.video._id]
    );

    if (videos?.length == 0) throw new ApiError(404, "Video Not Found");

    // Update View count
    await db.update("videos", req.video.id, { views: req.video.views + 1 });

    // Return response
    return res
        .status(200)
        .json(new ApiResponse(200, videos[0], "Video Fetched Sucessfully"))
})

// Update Video
const updateVideo = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.video.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Video !!!");
    }

    // Thumbnail Local Path
    const thumbnailLocalPath = req.file?.path;

    // if video or thumbnail is not uploaded throw error
    if (!thumbnailLocalPath && !req.body.thumbnail) {
        throw new ApiError(400, "Bad Request", ["Thumbnail is required"])
    }

    // Upload thumbnail to coludinary
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, req.user.id);

        if (thumbnail) {
            req.body.thumbnail = thumbnail?.public_id;
            await deleteFromCloudinary(req.video.thumbnail)
        } else {
            throw new ApiError(500, "Something Went wring while uplaoding image")
        }
    }

    // Update the video
    const updatedvideo = await db.update(
        "videos",
        req.video.id,
        req.body
    )

    // Throw error 
    if (!updateVideo) throw new ApiError(404, "video not found !!");

    // Return Response
    return res
        .status(200)
        .json(new ApiResponse(200, updatedvideo, "Video Updated Sucessfully"));

})

// Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.video.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Video !!!");
    }

    // Toggle video Status
    const updatedvideo = await db.update(
        "videos",
        req.video.id,
        { is_published: !req.video.is_published }
    );

    // Throw Error
    if (!updatedvideo) throw new ApiError(500, "internal server error !!!");

    // Return Response
    return res
        .status(200)
        .json(new ApiResponse(200, updatedvideo, "Status changed"));

})

// Delete Video
const deleteVideo = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.video.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Video !!!");
    }

    // Delete video and thumbnail from db
    await deleteFromCloudinary(req.video.thumbnail)
    await deleteFromCloudinary(req.video.video, "video")

    // Delete the video from db
    const deletedvideo = await db.delete("videos", req.video.id);

    // Throw error if video is not found
    if (!deletedvideo) throw new ApiError(404, "video not found !!");

    // return response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted sucessfully !!"));

})

export {
    getAllVideos,
    uploadVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    deleteVideo
}