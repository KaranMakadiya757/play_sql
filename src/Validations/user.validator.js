import Joi from 'joi';

const userValidationSchema = Joi.object({
    username: Joi.string()
        .trim()
        .lowercase()
        .required()
        .min(3)
        .max(10)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .messages({
            'string.base': 'Username must be a string',
            'string.empty': 'Username is required',
            'any.required': 'Username is required',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username must not exceed 10 characters',
            'string.pattern.base': 'Only alphanumeric characters and underscore are allowed'
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),

    fullname: Joi.string()
        .trim()
        .required()
        .min(3)
        .max(20)
        .messages({
            'string.base': 'Full name must be a string',
            'string.empty': 'Full name is required',
            'string.min': 'Full name must be at least 3 characters long',
            'string.max': 'Full name must not exceed 20 characters',
            'any.required': 'Full name is required'
        }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/)
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
            'any.required': 'Password is required'
        })
});

const userUpdateValidationSchema = Joi.object({
    username: Joi.string()
        .trim()
        .lowercase()
        .required()
        .min(3)
        .max(10)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .messages({
            'string.base': 'Username must be a string',
            'string.empty': 'Username is required',
            'any.required': 'Username is required',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username must not exceed 10 characters',
            'string.pattern.base': 'Only alphanumeric characters and underscore are allowed'
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),

    fullname: Joi.string()
        .trim()
        .required()
        .min(3)
        .max(20)
        .messages({
            'string.base': 'Full name must be a string',
            'string.empty': 'Full name is required',
            'string.min': 'Full name must be at least 3 characters long',
            'string.max': 'Full name must not exceed 20 characters',
            'any.required': 'Full name is required'
        }),

    avatar: Joi.string()
        .trim()
        .optional()
        .messages({
            'string.empty': 'Avatar Can not be Empty'
        }),

    coverimage: Joi.string()
        .trim()
        .optional()
        .allow("")
});

const userLoginValidationSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/)
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
            'any.required': 'Password is required'
        })
});

const userLoginWithOtpValidationSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        })
});

const userOtpValidationSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),

    otp: Joi.number()
        .integer()
        .min(100000)
        .max(999999)
        .required()
        .messages({
            'number.base': 'OTP must be a number',
            'number.min': 'OTP must be 6 digits long',
            'number.max': 'OTP must be 6 digits long',
            'any.required': 'OTP is required'
        })
});

const changepasswordValidationSchema = Joi.object({
    oldPassword: Joi.string()
        .required()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/)
        .messages({
            "string.empty": "Old Password cannot be empty",
            "string.min": "Old Password must be at least 8 characters long",
            "string.pattern.base": "Old Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
            "any.required": "Old Password is required"
        }),

    newPassword: Joi.string()
        .required()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/)
        .invalid(Joi.ref('oldPassword'))
        .messages({
            "string.empty": "New Password cannot be empty",
            "string.min": "New Password must be at least 8 characters long",
            "string.pattern.base": "New Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
            "any.invalid": "New Password must not be the same as the Old Password",
            "any.required": "New Password is required"
        })
});

export {
    userValidationSchema,
    userLoginValidationSchema,
    changepasswordValidationSchema,
    userUpdateValidationSchema,
    userLoginWithOtpValidationSchema,
    userOtpValidationSchema
};
