import { Router } from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import verifyId from "../middlewares/verifyId.middleware.js";

import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"

// Router instance
const router = Router();

// Secured Routes
router.use(verifyJWT);

/** Get all liked videos
 * 
 * @swagger
 * /like/videos:
 *   get:
 *     summary: Get all liked videos
 *     tags: [Like]
 *     responses:
 *       200:
 *         description: List of liked videos fetched successfully
 */
router.route("/videos").get(getLikedVideos);

/** Toggle Video likes
 * 
 * @swagger
 * /like/toggle/v/{videoId}:
 *   post:
 *     summary: Toggle like on a video
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       404:
 *         description: Video not found
 */
router.route("/toggle/v/:videoId").post(verifyId, toggleVideoLike);

/** Toggle Comment likes
 * 
 * @swagger
 * /like/toggle/c/{commentId}:
 *   post:
 *     summary: Toggle like on a comment
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       404:
 *         description: Comment not found
 */
router.route("/toggle/c/:commentId").post(verifyId, toggleCommentLike);

/** Toggle Tweet likes
 * 
 * @swagger
 * /like/toggle/t/{tweetId}:
 *   post:
 *     summary: Toggle like on a tweet
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tweet ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       404:
 *         description: Tweet not found
 */
router.route("/toggle/t/:tweetId").post(verifyId, toggleTweetLike);

export default router