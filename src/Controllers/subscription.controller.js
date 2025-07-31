import { pool } from "../DB/index.js";
import db from "../Utils/dbHelpers.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js"
import { asyncHandler } from "../Utils/asyncHandler.js";

// Toggle Channel Subscription
const toggleSubscription = asyncHandler(async (req, res) => {

    // Create a subscriber object
    const subobj = {
        subscriber: req.user.id,
        channel: req.channel.id
    }

    // Check Wheather the subscription is added or not
    const subscription = await db.findOne("subscriptions", subobj);

    // Toggle the subscription
    if (!subscription) {
        // Add subscription
        const newSubscriber = await db.create("subscriptions", subobj);

        // Throw error 
        if (!newSubscriber) throw new ApiError(500, "Something went wrong while adding subscription");

        // Return response
        return res
            .status(201)
            .json(new ApiResponse(200, {}, "Subscription added"))

    } else {
        // remove the subscription
        const removedSubscription = await db.delete("subscriptions", subscription.id);

        // Throw Error
        if (!removedSubscription) throw new ApiError(500, "Something went wrong while removing subscription");

        // Return Response
        return res
            .status(201)
            .json(new ApiResponse(200, {}, "Subscription removed"));
    }

})

// Get Subscribers List
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    // Fetch the subscriber list with user 
    const [subscriberList] = await pool.query(
        `
        SELECT 
            s.id,
            JSON_OBJECT(
                'id', u.id,
                'fullname', u.fullname,
                'username', u.username,
                'avatar', u.avatar
            ) AS subscriber
        FROM 
            subscriptions s
        JOIN 
            users u ON s.subscriber = u.id
        WHERE 
            s.channel = ?
        `,
        [req.user.id]
    );

    // Throw Error
    if (!subscriberList) throw new ApiError(500, "something went wrong while fetching the subscriber list")

    // Return response
    return res
        .status(200)
        .json(new ApiResponse(200, subscriberList, "Subscriber list fetched sucessfully"))

})

// Get Subscribed Channel List
const getSubscribedChannels = asyncHandler(async (req, res) => {

    // Fetch the subscribed Channel list with Channel info
    const [subscribedChannelList] = await pool.query(
        `
        SELECT 
            s.id,
            JSON_OBJECT(
                'id', u.id,
                'fullname', u.fullname,
                'username', u.username,
                'avatar', u.avatar
            ) AS channel
        FROM 
            subscriptions s
        JOIN 
            users u ON s.channel = u.id
        WHERE 
            s.subscriber = ?
        `,
        [req.user.id]
    );

    // Throw Error
    if (!subscribedChannelList) throw new ApiError(500, "something went wrong while fetching the subscribed channel list");

    // Return response
    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannelList, "subscribed channel list fetched sucessfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}