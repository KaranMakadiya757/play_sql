import db from "../Utils/dbHelpers.js";
import { ApiError } from "../Utils/apiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

const verifyId = asyncHandler(async (req, res, next) => {

    const { playlistId, videoId, channelId, commentId, tweetId } = req.params;
    const { videos } = req.body;

    // Validate videos array if provided
    if (Array.isArray(videos) && videos.length > 0) {
        const foundVideos = await db.findManyByIds("videos", videos);

        if (foundVideos.length !== videos.length) {
            throw new ApiError(404, "Bad request", ["One or more videos in the videos array do not exist"]);
        }
    }

    // Validate Video Id
    if (videoId) {
        const video = await db.findById("videos", videoId);
        if (!video) throw new ApiError(404, "Video Not Found !!");
        req.video = video;
    }

    // Validate Playlist Id
    if (playlistId) {
        const playlist = await db.findById("playlists", playlistId);
        if (!playlist) throw new ApiError(404, "Playlist Not Found !!");
        req.playlist = playlist;
    }

    // Validate Channel Id
    if (channelId) {
        const channel = await db.findById("users", channelId);
        if (!channel) throw new ApiError(404, "Channel Not Found !!");
        req.channel = channel;
    }

    // Validate Comment Id
    if (commentId) {
        const comment = await db.findById("comments", commentId);
        if (!comment) throw new ApiError(404, "Comment Not Found !!");
        req.comment = comment;
    }

    // Validate Tweet Id
    if (tweetId) {
        const tweet = await db.findById("tweets", tweetId);
        if (!tweet) throw new ApiError(404, "Tweet Not Found !!");
        req.tweet = tweet;
    }

    next();
});

export default verifyId;