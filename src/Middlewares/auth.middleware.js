import jwt from "jsonwebtoken";
import db from "../Utils/dbHelpers.js";
import { ApiError } from "../Utils/apiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Get the access token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // Throw error if no token is provided
        if (!token) {
            throw new ApiError(401, "Unauthorized Request");
        }

        // Decode and verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Get user from DB using raw SQL (excluding password and refreshToken)
        const user = await db.findOne("users", { id: decodedToken?.id }, "AND", ["password", "refreshToken", "otp", "otp_expiry"]);

        // Throw error if user is not found
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Set user in request
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});
