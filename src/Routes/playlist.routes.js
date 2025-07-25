import { Router } from "express"
import verifyId from "../middlewares/verifyId.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import validate from "../middlewares/validation.middleware.js"
import { playlistValidationSchema } from "../Validations/playlist.validator.js"

import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"

// Router Instance
const router = Router()

// Secure Routes
router.use(verifyJWT)

/** Get All Playlists for the User
 * 
 * @swagger
 * /playlist/my-playlists:
 *   get:
 *     summary: Get all playlists for the user
 *     tags: [Playlist]
 *     responses:
 *       200:
 *         description: List of playlists fetched successfully
 */
router.route("/my-playlists").get(getUserPlaylists)

/** Get Playlist by ID
 * 
 * @swagger
 * /playlist/{playlistId}:
 *   get:
 *     summary: Get playlist by ID
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Playlist fetched successfully
 *       404:
 *         description: Playlist not found
 */
router.route("/:playlistId").get(verifyId, getPlaylistById)

/** Create Playlist
 * 
 * @swagger
 * /playlist:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Playlist
 *               description:
 *                 type: string
 *                 example: Playlist description
 *     responses:
 *       201:
 *         description: Playlist created successfully
 *       400:
 *         description: Bad request
 */
router.route("/").post(validate(playlistValidationSchema), createPlaylist)

/** Update Playlist
 * 
 * @swagger
 * /playlist/{playlistId}:
 *   patch:
 *     summary: Update a playlist
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Playlist
 *               description:
 *                 type: string
 *                 example: Updated description
 *     responses:
 *       200:
 *         description: Playlist updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Playlist not found
 */
router.route("/:playlistId").patch(validate(playlistValidationSchema), verifyId, updatePlaylist)

/** Add video to playlist
 * 
 * @swagger
 * /playlist/add/{videoId}/{playlistId}:
 *   patch:
 *     summary: Add video to playlist
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: Video ID
 *       - in: path
 *         name: playlistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Video added to playlist successfully
 *       404:
 *         description: Playlist or video not found
 */
router.route("/add/:videoId/:playlistId").patch(verifyId, addVideoToPlaylist)

/** Remove video from playlist
 * 
 * @swagger
 * /playlist/remove/{videoId}/{playlistId}:
 *   patch:
 *     summary: Remove video from playlist
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: Video ID
 *       - in: path
 *         name: playlistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Video removed from playlist successfully
 *       404:
 *         description: Playlist or video not found
 */
router.route("/remove/:videoId/:playlistId").patch(verifyId, removeVideoFromPlaylist)

/** Delete Playlist
 * 
 * @swagger
 * /playlist/{playlistId}:
 *   delete:
 *     summary: Delete a playlist
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Playlist deleted successfully
 *       404:
 *         description: Playlist not found
 */
router.route("/:playlistId").delete(verifyId, deletePlaylist)

export default router