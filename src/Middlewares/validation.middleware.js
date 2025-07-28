import { ApiError } from "../utils/apiError.js";

const validate = (schema) => {
    return (req, res, next) => {
        const isBodyEmpty = !req.body || Object.keys(req.body).length === 0;
        const hasNoFile = !req.file && (!req.files || Object.keys(req.files).length === 0);

        if (isBodyEmpty && hasNoFile) {
            throw new ApiError(400, "Bad Request !! No Payload Provided");
        }

        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const validationErrors = error.details.map(detail => detail.message);

            throw new ApiError(400, "Bad Request", validationErrors);
        }

        next();
    }
}

export default validate;