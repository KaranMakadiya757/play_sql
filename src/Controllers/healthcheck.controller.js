import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiResponse.js"

const healthcheck = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new ApiResponse(200, "Servers are running !! Go Ahead :)"))
})

export {
    healthcheck
}