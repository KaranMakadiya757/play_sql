import { Router } from "express";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    registerUser,
    updateAccountDetails,
    refereshAccessToken,
    deleteUser,
    sendOTP,
    verifyOTP
} from "../controllers/user.controller.js";

import {
    changepasswordValidationSchema,
    userLoginValidationSchema,
    userLoginWithOtpValidationSchema,
    userOtpValidationSchema,
    userUpdateValidationSchema,
    userValidationSchema
} from "../Validations/user.validator.js";

import validate from "../middlewares/validation.middleware.js";

// create router instance
const userRouter = Router();

/** Reigster user
 * 
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *               fullname:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: Password@123
 *               avatar:
 *                 type: string
 *                 format: binary
 *               coverimage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
userRouter.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverimage', maxCount: 1 }
    ]),
    validate(userValidationSchema),
    registerUser
)

/** Login
 * 
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: User does not exist
 */
userRouter.route("/login").post(validate(userLoginValidationSchema), loginUser)

/** Send OTp
 * @swagger
 * /user/login/send-otp:
 *   post:
 *     summary: Send OTP to user email for login
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 */
userRouter.route("/login/send-otp").post(validate(userLoginWithOtpValidationSchema), sendOTP)

/** Verify OTP
 * @swagger
 * /user/login/verify-otp:
 *   post:
 *     summary: Verify OTP for user login
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully, user logged in
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
userRouter.route("/login/verify-otp").post(validate(userOtpValidationSchema), verifyOTP)

/** Refresh Access Token
 * @swagger
 * /user/referesh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: <refresh_token>
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized request
 */
userRouter.route("/referesh-token").post(refereshAccessToken)

// SECURED ROUTES
userRouter.use(verifyJWT)

/** Get Current User Information
 * 
 * @swagger
 * /user/getcurrentuser:
 *   get:
 *     summary: Get current user information
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.route("/getcurrentuser").get(getCurrentUser)

/** Get Channel Information By Channel Name
 * 
 * @swagger
 * /user/c/{username}:
 *   get:
 *     summary: Get channel information by channel name
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Channel username
 *     responses:
 *       200:
 *         description: Channel information fetched successfully
 *       404:
 *         description: Channel does not exist
 */
userRouter.route("/c/:username").get(getUserChannelProfile)

/** Get Watch History
 * @swagger
 * /user/history:
 *   get:
 *     summary: Get user watch history
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Watch history fetched successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.route("/history").get(getWatchHistory)

/** Update User Details
 * 
 * @swagger
 * /user/changeaccountdetails:
 *   patch:
 *     summary: Update user account details
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *               fullname:
 *                 type: string
 *                 example: John Doe
 *               avatar:
 *                 type: string
 *                 format: binary
 *               coverimage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Account details updated successfully
 *       400:
 *         description: Bad request
 */
userRouter.route("/changeaccountdetails").patch(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverimage', maxCount: 1 }
    ]),
    validate(userUpdateValidationSchema),
    updateAccountDetails
)

/** Change Password
 * 
 * @swagger
 * /user/changepassword:
 *   patch:
 *     summary: Change user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: OldPassword@123
 *               newPassword:
 *                 type: string
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password
 */
userRouter.route("/changepassword").patch(validate(changepasswordValidationSchema), changeCurrentPassword)

/** Logout
 * 
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Internal server error
 */
userRouter.route("/logout").post(logoutUser)

/** Delete User By ID
 * @swagger
 * /user:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
userRouter.route("/").delete(deleteUser);

export default userRouter;