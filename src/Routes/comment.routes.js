import { Router } from 'express';
import verifyId from '../middlewares/verifyId.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import { commentValidationSchema } from '../Validations/comment.validator.js';

import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"


// Router Instance
const router = Router();

// Secured Routes
router.use(verifyJWT);

/** Get video Comments
 * 
 * @swagger
 * /comment/{videoId}:
 *   get:
 *     summary: Get comments for a video
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: Video ID
 *     responses:
 *       200:
 *         description: List of comments fetched successfully
 *       404:
 *         description: Video not found
 */
router.route("/:videoId").get(verifyId, getVideoComments);

/** Add Comment in video
 * 
 * @swagger
 * /comment/{videoId}:
 *   post:
 *     summary: Add a comment to a video
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: Nice video!
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Bad request
 */
router.route("/:videoId").post(verifyId, validate(commentValidationSchema), addComment);

/** Update Comment
 * 
 * @swagger
 * /comment/{commentId}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: Updated comment
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Comment not found
 */
router.route("/:commentId").patch(verifyId, validate(commentValidationSchema), updateComment);

/** Delete Comment
 * 
 * @swagger
 * /comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.route("/:commentId").delete(verifyId, deleteComment);

export default router