import Joi from "joi";

// Validation for register
const registerValidation = Joi.object({
  name: Joi.string()
    .min(4)
    .max(15)
    .required()
    .pattern(/^\S+$/)
    .messages({
      'string.min': 'Name must be at least 4 characters long.',
      'string.max': 'Name must not exceed 15 characters.',
      'string.empty': 'Name is required.',
      'string.pattern.base': 'Name must not contain spaces.',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address.',
      'string.empty': 'Email is required.',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.empty': 'Password is required.',
    }),
  timezone: Joi.string()
    .required()
    .messages({
      'string.empty': 'Timezone is required.',
    }),
});

export default registerValidation;
