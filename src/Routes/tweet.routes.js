import { Router } from 'express';
import verifyId from '../middlewares/verifyId.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import { tweetValidationSchema } from '../Validations/tweet.validator.js';

import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"

// Router instance
const router = Router();

// Secured routes
router.use(verifyJWT);

/** Get user Tweets
 * 
 * @swagger
 * /tweet/my-tweets:
 *   get:
 *     summary: Get all tweets for the current user
 *     tags: [Tweet]
 *     responses:
 *       200:
 *         description: List of tweets fetched successfully
 */
router.route("/my-tweets").get(getUserTweets);

/** Create tweet
 * 
 * @swagger
 * /tweet:
 *   post:
 *     summary: Create a new tweet
 *     tags: [Tweet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: This is my tweet!
 *     responses:
 *       201:
 *         description: Tweet created successfully
 *       400:
 *         description: Bad request
 */
router.route("/").post(validate(tweetValidationSchema), createTweet);

/** Update tweet
 * 
 * @swagger
 * /tweet/{tweetId}:
 *   patch:
 *     summary: Update a tweet
 *     tags: [Tweet]
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tweet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: Updated tweet content
 *     responses:
 *       200:
 *         description: Tweet updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Tweet not found
 */
router.route("/:tweetId").patch(verifyId, validate(tweetValidationSchema), updateTweet);

/** Delete tweet
 * 
 * @swagger
 * /tweet/{tweetId}:
 *   delete:
 *     summary: Delete a tweet
 *     tags: [Tweet]
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tweet ID
 *     responses:
 *       200:
 *         description: Tweet deleted successfully
 *       404:
 *         description: Tweet not found
 */
router.route("/:tweetId").delete(verifyId, deleteTweet);

export default router