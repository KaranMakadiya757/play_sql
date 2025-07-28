import multer from "multer"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { ApiError } from "../utils/apiError.js"

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/temp')
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname)
		const name = path.basename(file.originalname, ext).replace(/\s+/g, "_")
		const uniqueName = `${name}-${uuidv4()}${ext}`
		cb(null, uniqueName)
	}
})

// ✅ File Filter
const fileFilter = (req, file, cb) => {
	if (["video"]?.includes(file.fieldname)) {
		const allowedTypes = ["video/mp4", "video/mkv", "video/webm"];
		if (allowedTypes.includes(file.mimetype)) {
			return cb(null, true);
		}
		return cb(new ApiError(400, 'Bad Request', ["Only mp4, mkv or webm files are allowed for videos!"]));
	} else {
		const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
		if (allowedTypes.includes(file.mimetype)) {
			return cb(null, true);
		}
		return cb(new ApiError(400, 'Bad Request', ["Only jpeg, png, jpg or webp files are allowed for thumbnails!"]));
	}
};


export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})