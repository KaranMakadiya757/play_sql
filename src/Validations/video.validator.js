import Joi from "joi";

const videoValidationSchema = Joi.object({
    thumbnail: Joi.string()
        .optional(),

    title: Joi.string()
        .required()
        .min(5)
        .max(50)
        .messages({
            "string.base": "Title must be a string.",
            "string.empty": "Title is required.",
            "string.min": "Title must be at least 5 characters long",
            "string.max": "Title must not exceed 50 characters",
            "any.required": "Title is required."
        }),

    description: Joi.string()
        .required()
        .min(5)
        .max(505)
        .messages({
            "string.base": "Description must be a string.",
            "string.empty": "Description is required.",
            "string.min": "Description must be at least 5 characters long",
            "string.max": "Description must not exceed 500 characters",
            "any.required": "Description is required."
        }),

    isPublished: Joi.boolean()
        .optional()
        .messages({
            "boolean.base": "isPublished must be a boolean value."
        })
});

export {
    videoValidationSchema
}