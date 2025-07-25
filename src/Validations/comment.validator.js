import Joi from 'joi'

const commentValidationSchema = Joi.object({
    content: Joi.string()
        .required()
        .min(3)
        .max(200)
        .messages({
            'string.base': 'Comment content must be a string.',
            'string.empty': 'Comment content is required.',
            'string.min': 'Comment content must be at least 3 characters long.',
            'string.max': 'Comment content must not exceed 200 characters.',
            'any.required': 'Comment content is required.'
        })
});

export {
    commentValidationSchema
}