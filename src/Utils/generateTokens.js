import jwt from "jsonwebtoken";
import db from "../Utils/dbHelpers.js";
import { ApiError } from "../Utils/apiError.js";

// Utility Function to create Refresh and Access Tokens
const generateAccessAndRefreshToken = async (user) => {
    try {
        const accessToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.REFERSH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // Save refreshToken in DB
        await db.update("users", user.id, { refreshToken });

        return { accessToken, refreshToken };
    } catch {
        throw new ApiError(500, "Something went wrong while generating the referesh and access tokens");
    }
}

export default generateAccessAndRefreshToken;