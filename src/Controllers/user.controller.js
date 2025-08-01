import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../Utils/dbHelpers.js";
import { cookieOption } from "../constants.js"
import { ApiError } from "../Utils/apiError.js";
import { sendEmail } from "../Utils/sendmail.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { otpTemplate } from "../Templates/otpTemplate.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../Utils/fileOperation.js";
import { welcomeTemplate } from "../Templates/welcomeTemplate.js";
import generateAccessAndRefreshToken from "../Utils/generateTokens.js";


// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { email, username } = req.body;

    // Check if user already exists by username or email
    const existingUser = await db.findOne("users", { username, email }, "OR");

    if (existingUser) {
        throw new ApiError(409, "User with Username or Email exists");
    }

    // Get avatar file path
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Bad Request", ["Avatar is required"]);

    // Upload avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath, "Profile");
    if (avatar) {
        req.body.avatar = avatar?.public_id;
    } else {
        throw new ApiError(500, "Something went wrong while uploading Avatar");
    }

    // Handle cover image if provided
    const coverImageLocalPath = req.files?.coverimage?.[0]?.path;
    if (coverImageLocalPath) {
        const coverimage = await uploadOnCloudinary(coverImageLocalPath, "Profile");
        if (coverimage) {
            req.body.coverimage = coverimage?.public_id;
        } else {
            throw new ApiError(500, "Something went wrong while uploading the cover image");
        }
    }

    // Hash Password
    req.body.password = await bcrypt.hash(req.body.password, 10);

    // Create user in SQL database
    const user = await db.create("users", req.body);

    // Fetch created user (remove sensitive fields)
    let createdUser = await db.findById("users", user.id, ["password", "refreshToken", "otp", "otp_expiry"]);

    // Throw error
    if (!createdUser) throw new ApiError(500, "Internal server error");

    // Send welcome email
    await sendEmail({
        to: createdUser.email,
        subject: "Welcome to PlayTube!",
        html: welcomeTemplate(createdUser.fullname),
    });

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {

    // GET USERNAME , EMAIL AND PASSWORD FROM THE REQUEST BODY
    const { password, email } = req.body

    // FIND THE USER BY EMAIL AND THROW ERROR IF USER DOES NOT EXISTS
    const user = await db.findOne("users", { email });

    // Throw error if user does not exist
    if (!user) throw new ApiError(403, "", ["user does not exist"]);


    // CHECK WEATHER THE PASSWORD IS CORRECT AND THROW ERROR IS THE PASSWORD IS INCORRECT
    const isPasswordValid = await bcrypt.compare(password, user.password);


    // Throw error
    if (!isPasswordValid) throw new ApiError(401, "Invalid User Credentials");


    // GENERATING THE FERERESH AND ACCESS TOKENS
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user)

    // GET THE LOGGED IN USER
    const loggedInUser = await db.findById("users", user.id, ["password", "refreshToken", "otp", "otp_expiry"])

    // RETURN THE RESPONSE 
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User Logged In Successfully"
            )
        )
})

// Send OTP
const sendOTP = asyncHandler(async (req, res) => {

    // GET USERNAME , EMAIL AND PASSWORD FROM THE REQUEST BODY
    const { email } = req.body

    // FIND THE USER BY USERNAME OR EMAIL AND THROW ERROR IF USER DOES NOT EXISTS
    const user = await db.findOne("users", { email })

    // Throw error if user does not exist
    if (!user) throw new ApiError(403, "", ["user does not exist"]);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send otp in the mail
    await sendEmail({
        to: user.email,
        subject: "OTP for playtube login!",
        html: otpTemplate(user.fullname, otp),
    });

    // update otp and otp expiry in the user model
    await db.update(
        "users",
        user.id,
        {
            otp: await bcrypt.hash(otp.toString(), 10),
            otp_expiry: new Date(Date.now() + 5 * 60 * 1000)
        }
    )

    // RETURN THE RESPONSE 
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "OTP sent successfully !! Check your registered Email for the same"))
})

// Verify OTP
const verifyOTP = asyncHandler(async (req, res) => {

    // GET USERNAME , EMAIL AND PASSWORD FROM THE REQUEST BODY
    const { email, otp } = req.body

    // FIND THE USER BY USERNAME OR EMAIL AND THROW ERROR IF USER DOES NOT EXISTS
    const user = await db.findOne("users", { email });

    // Throw error if user does not exist
    if (!user) throw new ApiError(403, "", ["user does not exist"]);

    // CHECK WEATHER THE OTP IS CORRECT AND THROW ERROR IS THE PASSWORD IS INCORRECT
    const isOTPValid = await bcrypt.compare(otp.toString(), user?.otp ?? "");

    // Throw error
    if (!isOTPValid) throw new ApiError(401, "Invalid OTP !!!");


    // GENERATING THE FERERESH AND ACCESS TOKENS
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user)

    // Remove the OTP and OTP expiry from db
    await db.update("users", user.id, { otp: undefined, otp_expiry: undefined })

    // GET THE LOGGED IN USER
    const loggedInUser = await db.findById("users", user.id, ["password", "refreshToken", "otp", "otp_expiry"])

    // RETURN THE RESPONSE 
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "OTP Verified !!! Logged in Successfully"
            )
        )
})

// Logout
const logoutUser = asyncHandler(async (req, res) => {

    // Find the user by ID and remove refresh Token
    const updatedUser = await db.update(
        "users",
        req.user.id,
        { refreshToken: null }
    )

    // Throw Error if User is not created
    if (!updatedUser) throw new ApiError(500, "Inter server error !!!");

    // return response
    return res
        .status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(new ApiResponse(200, {}, "Logged out sucessfully"))

})

// Refresh Access Token
const refereshAccessToken = asyncHandler(async (req, res) => {

    // GET THE TOKEN FROM COOKIES OR REQUEST BODY
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    //  THROW ERROR IF THERE ARE NO TOKENS 
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request");

    //  VERIFY THE TOKEN
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFERSH_TOKEN_SECRET);

    // GET THE USER FROM THE DATABASE
    const user = await db.findById("users", decodedToken.id);


    //  THROW ERROR UF THERE ARE NO USER ASSOCIATED WITH THE GIVEN REFERESH TOKEN
    if (!user) throw new ApiError(401, "Invalid Referesh token");

    // GENERATE NEW ACCESSTOKEN AND REFRESHTOKEN
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user)

    // Return Response
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(new ApiResponse(
            200,
            { accessToken, refreshToken },
            "Referesh Token generated sucessfully"
        ))
})

// Change current Password
const changeCurrentPassword = asyncHandler(async (req, res) => {

    // GET THE OLD AND NEW PASSWORD FROM THE REQUEST BODY
    const { oldPassword, newPassword } = req.body;

    // FIND THE USER BY THE USER ID
    const user = await db.findById("users", req.user?.id);

    // CHECK WEATHER THE OLD PASSWORD IS VALID OR NOT
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    // IF OLD PASSWORD IS NOT VALID THEN THROW NEW ERROR
    if (!isPasswordValid) throw new ApiError(400, "Invalid password");

    //  IF THE PASSWORD IS VALID THEN UPDATE IT IN THE DATABASE
    await db.update("users", req.user?.id, { password: await bcrypt.hash(newPassword, 10) })

    // RETURN THE RESPONSE
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed sucessfully"))

})

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched sucessfully"))
})

// Update User Details
const updateAccountDetails = asyncHandler(async (req, res) => {

    // Get Avatar and Cover Image Local Path 
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverimage?.[0]?.path;

    // Throw error if Avatar is not Provided
    if (!avatarLocalPath && !req.body?.avatar) throw new ApiError(400, "Bad Request", ["Avatar is required"]);

    // if avatar is provided upload it to coludinary 
    if (avatarLocalPath) {

        const avatar = await uploadOnCloudinary(avatarLocalPath, "Profile");

        if (avatar) {
            req.body.avatar = avatar?.public_id;
            await deleteFromCloudinary(req.user.avatar)
        } else {
            throw new ApiError(500, "Something went wrong while uploading the cover image");
        }
    }

    // if cover image is provided upload it to coludinary 
    if (coverImageLocalPath) {

        const coverimage = await uploadOnCloudinary(coverImageLocalPath, "Profile");

        if (coverimage) {
            req.body.coverimage = coverimage?.public_id;
            await deleteFromCloudinary(req.user.coverimage)
        } else {
            throw new ApiError(500, "Something went wrong while uploading the cover image");
        }
    }

    // Delete cover image if no cover image is provided
    if ((req.body.coverimage)?.trim() === "") {
        await deleteFromCloudinary(req.user.coverimage)
    }


    // FIND THE USER BY THE USER ID AND UPDATE THE INFORMATION
    const user = await db.update(
        "users",
        req.user?.id,
        req.body
    )

    //  RETURN THE RESPONSE
    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Account details updated sucessfully"))
})

// Get User Channel Info 
const getUserChannelProfile = asyncHandler(async (req, res) => {
    // // GET THE USERNAME FROM THE REQUEST PARAMETER
    // const { username } = req.params

    // // THROW ERROR IF THERE ARE NO USERNAME
    // if (!username?.trim()) {
    //     throw new ApiError(400, "username is missing")
    // }

    // // APPLY AGGERATE PIPELINE IN THE DB AND CREATE A CHANNEL OBJECT 
    // const channel = await User.aggregate([
    //     {
    //         $match: {
    //             username: username?.toLowerCase()
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "subscriptions",
    //             localField: "_id",
    //             foreignField: "channel",
    //             as: "subscribers"
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "subscriptions",
    //             localField: "_id",
    //             foreignField: "subscriber",
    //             as: "subscribedTo"
    //         }
    //     },
    //     {
    //         $addFields: {
    //             subscribersCount: {
    //                 $size: "$subscribers"
    //             },
    //             channelCount: {
    //                 $size: "$subscribedTo"
    //             },
    //             isubscribed: {
    //                 $cond: {
    //                     if: { $in: [req.user._id, "$subscribers.subscriber"] },
    //                     then: true,
    //                     else: false
    //                 }
    //             }
    //         }
    //     },
    //     {
    //         $project: {
    //             fullname: 1,
    //             username: 1,
    //             subscribersCount: 1,
    //             channelCount: 1,
    //             isubscribed: 1,
    //             avatar: 1,
    //             coverimage: 1,
    //             email: 1
    //         }
    //     }
    // ])

    // // THROW ERROR IF THERE ARE NO CHANNEL 
    // if (!channel?.length) {
    //     throw new ApiError(404, "channel does not exists")
    // }

    // // RETURN THE RESPONSE
    // return res
    //     .status(200)
    //     .json(new ApiResponse(200, channel[0], "data fetched successfully"))
})

// Get Watch History
const getWatchHistory = asyncHandler(async (req, res) => {

    // const user = await User.aggregate([
    //     {
    //         $match: {
    //             _id: new mongoose.Types.ObjectId(req.user._id)
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "videos",
    //             localField: "watchhistory",
    //             foreignField: "_id",
    //             as: "watchHistory",
    //             pipeline: [
    //                 {
    //                     $lookup: {
    //                         from: "users",
    //                         localField: "owner",
    //                         foreignField: "_id",
    //                         as: "owner",
    //                         pipeline: [
    //                             {
    //                                 $project: {
    //                                     fullname: 1,
    //                                     username: 1,
    //                                     avatar: 1
    //                                 }
    //                             }
    //                         ]
    //                     }
    //                 },
    //                 {
    //                     $addFields: {
    //                         owner: { $first: "$owner" }
    //                     }
    //                 }
    //             ]
    //         }
    //     }
    // ])

    // return res
    //     .status(200)
    //     .json(new ApiResponse(
    //         200,
    //         user[0].watchHistory,
    //         "Watch History Fetched sucessfully"
    //     ))
})

// Delete User
const deleteUser = asyncHandler(async (req, res) => {

    // Delete images on cloudinary
    await deleteFromCloudinary(req.user.avatar)
    await deleteFromCloudinary(req.user.coverimage)

    // Delete the user from db
    const deletedUser = await db.delete("users", req.user.id);

    // Throw error if video is not found
    if (!deletedUser) throw new ApiError(404, "User not found !!");

    // return response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User deleted sucessfully !!"));

})


export {
    registerUser,
    loginUser,
    sendOTP,
    verifyOTP,
    logoutUser,
    refereshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    getUserChannelProfile,
    getWatchHistory,
    deleteUser
}