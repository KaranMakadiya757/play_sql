import cors from "cors";
import express from "express";
import cookieparser from "cookie-parser";
import errorHandler from "./Middlewares/errorhandler.middleware.js";

// EXPRESS APP CREATION 
const app = express()

// USING CORS MIDDLEWARE 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ limit: "16kb", extended: true }))
app.use(express.static("public"))
app.use(cookieparser())




app.use(errorHandler)

export { app }