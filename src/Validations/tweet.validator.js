import Joi from 'joi'

const tweetValidationSchema = Joi.object({
    content: Joi.string()
        .required()
        .min(3)
        .max(500)
        .messages({
            'string.base': 'Tweet content must be a string.',
            'string.empty': 'Tweet content is required.',
            'string.min': 'Tweet content must be at least 3 characters long.',
            'string.max': 'Tweet content must not exceed 500 characters.',
            'any.required': 'Tweet content is required.'
        })
});

export {
    tweetValidationSchema
}