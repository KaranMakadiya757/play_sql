import db from "../Utils/dbHelpers.js";
import { pool } from "../DB/index.js";
import { ApiError } from "../Utils/apiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiResponse } from "../Utils/apiResponse.js"

// Get Playlist with videos by ID
const getPlaylistWithVideos = async (playlistId) => {
    const [rows] = await pool.query(
        `
        SELECT 
          p.id AS playlist_id,
          p.name AS playlist_name,
          p.description AS playlist_description,
          v.id AS video_id,
          v.title,
          v.description,
          v.thumbnail,
          v.duration
        FROM playlists p
        LEFT JOIN playlist_videos pv ON p.id = pv.playlist
        LEFT JOIN videos v ON pv.video = v.id
        WHERE p.id = ?
        `,
        [playlistId]
    );

    if (!rows || rows.length === 0) {
        throw new ApiError(404, "Playlist not found");
    }

    const playlist = {
        id: rows[0].playlist_id,
        name: rows[0].playlist_name,
        description: rows[0].playlist_description,
        videos: rows
            .filter(row => row.video_id !== null)
            .map(row => ({
                id: row.video_id,
                title: row.title,
                description: row.description,
                thumbnail: row.thumbnail,
                duration: row.duration
            }))
    };

    return playlist;
};

// Create PLaylist
const createPlaylist = asyncHandler(async (req, res) => {

    // Create Playlist 
    const playlist = await db.create(
        "playlists",
        {
            name: req.body.name,
            description: req.body.description,
            owner: req.user.id
        }
    );

    // Throw Error
    if (!playlist) throw new ApiError(500, "Something went wrong while creating playlist");

    // Add videos in the playlist
    if (req.body.videos && req.body.videos.length > 0) {
        for (const video of req.body.videos) {
            await db.create("playlist_videos", {
                playlist: playlist.id,
                video: video
            });
        }
    }

    // Return response
    return res
        .status(201)
        .json(new ApiResponse(201, await getPlaylistWithVideos(playlist.id), "Playlist created successfully"));

});

// Get User Playlists
const getUserPlaylists = asyncHandler(async (req, res) => {

    // Fetch the User PLaylists from the DB
    const [userplaylist] = await pool.query(
        `
        SELECT *
        FROM playlists
        WHERE owner = ?
        `,
        [req.user.id]
    );

    // Throw Error
    if (!userplaylist) throw new ApiError(500, "Something went wrong while fetching the playlists");

    // Return Response
    return res
        .status(200)
        .json(new ApiResponse(200, userplaylist, "User playlists fetched successfully"))

});

// Get Playlist By ID
const getPlaylistById = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.playlist.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Resource !!!");
    }

    // Return the Playlist
    return res
        .status(200)
        .json(new ApiResponse(200, await getPlaylistWithVideos(req.playlist.id), "playlist fetched successfully"))
});

// Update Playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    // Check ownership
    if (req.playlist.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You don't have access to this resource.");
    }

    const { videos, ...body } = req.body;

    // Update the playlist's basic info (name, description, etc.)
    const updatedPlaylist = await db.update(
        "playlists",
        req.playlist.id,
        body
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong while updating the playlist.");
    }

    // get current playlist and videos
    const currentPlaylist = await getPlaylistWithVideos(req.playlist.id);
    const currentVideos = currentPlaylist.videos?.map(video => video.id);

    // Handle video updates if the "videos" field is present
    if (Array.isArray(videos)) {
        // const currentVideos = req.playlist.videos || [];

        const videosToRemove = currentVideos.filter(cv => !videos.includes(cv));
        const videosToAdd = videos.filter(v => !currentVideos.includes(v));

        // Remove unwanted videos
        for (const videoId of videosToRemove) {
            await db.deleteOne("playlist_videos", {
                playlist: req.playlist.id,
                video: videoId
            });
        }

        // Add new videos
        for (const videoId of videosToAdd) {
            await db.create("playlist_videos", {
                playlist: req.playlist.id,
                video: videoId
            });
        }
    }

    // Return the updated playlist with videos
    const fullPlaylist = await getPlaylistWithVideos(req.playlist.id);
    return res
        .status(200)
        .json(new ApiResponse(200, fullPlaylist, "Playlist updated successfully"));
});

// Add Video to the Playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.playlist.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Resource !!!");
    }

    // Check if Video already exists in the playlist
    const isAdded = await db.findOne("playlist_videos", {
        playlist: req.playlist.id,
        video: req.video.id
    })
    if (isAdded) throw new ApiError(400, "Video is already present in the playlist");

    // add video into playlist
    const updatedPlaylist = await db.create(
        "playlist_videos",
        {
            playlist: req.playlist.id,
            video: req.video.id
        }
    );

    // Throw Error
    if (!updatedPlaylist) throw new ApiError(500, "something went wrong while removing the video");

    // Return response
    return res
        .status(200)
        .json(new ApiResponse(200, await getPlaylistWithVideos(req.playlist.id), "Video added to playlist successfully"));

});

// Remove video From the playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.playlist.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Resource !!!");
    }

    // Check if Video exists in the playlist
    const isAdded = await db.findOne("playlist_videos", {
        playlist: req.playlist.id,
        video: req.video.id
    })
    if (!isAdded) throw new ApiError(400, "Video you want to remove does not exist in the playlist");

    // remove video from playlist
    const updatedPlaylist = await db.deleteOne(
        "playlist_videos",
        {
            playlist: req.playlist.id,
            video: req.video.id
        }
    )

    // Throw Error
    if (!updatedPlaylist) throw new ApiError(500, "something went wrong while removing the video")

    // Return Response
    return res
        .status(200)
        .json(new ApiResponse(200, await getPlaylistWithVideos(req.playlist.id), "Video removed from playlist successfully"))

});

// Delete PLaylist
const deletePlaylist = asyncHandler(async (req, res) => {

    // check the ownership
    if (req.playlist.owner?.toString() !== req.user.id?.toString()) {
        throw new ApiError(403, "You Don't have access to this Resource !!!");
    }

    // FInd the playlist by ID and delete it
    const deletedPlaylist = await db.delete("playlists", req.playlist.id);

    // throw Error
    if (!deletedPlaylist) throw new ApiError(500, "Something went wrong while deleting the playlist");

    // Return Response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted sucessfully"))
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};