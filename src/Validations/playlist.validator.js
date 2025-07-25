import Joi from 'joi'

const playlistValidationSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(3)
        .max(50)
        .messages({
            'string.base': 'Playlist name must be a string.',
            'string.empty': 'Playlist name is required.',
            'string.min': 'Playlist name must be at least 3 characters long.',
            'string.max': 'Playlist name must not exceed 50 characters.',
            'any.required': 'Playlist name is required.'
        }),

    description: Joi.string()
        .required()
        .min(5)
        .max(500)
        .messages({
            'string.base': 'Description must be a string.',
            'string.empty': 'Description is required.',
            'string.min': 'Description must be at least 5 characters long.',
            'string.max': 'Description must not exceed 500 characters.',
            'any.required': 'Description is required.'
        }),

    videos: Joi.array()
        .optional()
        .items(Joi.string().hex().length(24).messages({
            'string.base': 'Each video ID must be a string.',
            'string.hex': 'Each video ID must be a valid ObjectId.',
            'string.length': 'Each video ID must be 24 characters long.'
        }))
        .messages({
            'array.base': 'Videos must be an array of video IDs.'
        })
});

export {
    playlistValidationSchema
}