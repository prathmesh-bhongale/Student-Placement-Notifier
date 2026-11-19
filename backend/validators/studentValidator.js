const Joi = require('joi');

const percent = (label) =>
  Joi.number().min(0).max(100).messages({
    'number.base': `${label} must be a number`,
    'number.min': `${label} must be between 0 and 100`,
    'number.max': `${label} must be between 0 and 100`,
  });

const stringList = Joi.array().items(Joi.string().trim().min(1).max(60));

const profileFields = {
  name: Joi.string().trim().min(2).max(100).pattern(/^[A-Za-z ]+$/).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.pattern.base': 'Name must contain only letters and spaces',
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  phone: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Phone number must be exactly 10 digits',
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
  }),
  address: Joi.string().trim().min(5).max(500).required().messages({
    'string.min': 'Address must be at least 5 characters',
    'string.empty': 'Address is required',
    'any.required': 'Address is required',
  }),
  percentage10: percent('10th percentage').required().messages({
    'any.required': '10th percentage is required',
    'number.base': '10th percentage must be a number',
  }),
  percentage12: percent('12th percentage').allow(null),
  diplomaPercentage: percent('Diploma percentage').allow(null),
  sem6Percentage: percent('Semester 6 percentage').allow(null),
  backlogs: Joi.number().integer().min(0).required().messages({
    'number.min': 'Backlogs cannot be negative',
    'number.integer': 'Backlogs must be a whole number',
    'number.base': 'Backlogs must be a number',
    'any.required': 'Backlogs is required',
  }),
  skills: stringList.min(1).required().messages({
    'array.min': 'At least one skill is required',
    'any.required': 'At least one skill is required',
  }),
  certifications: stringList.default([]),
};

const registerSchema = Joi.object({
  ...profileFields,
  prn: Joi.string().trim().alphanum().min(6).max(20).uppercase().required().messages({
    'string.min': 'PRN must be at least 6 characters',
    'string.alphanum': 'PRN must be alphanumeric',
    'string.empty': 'PRN is required',
    'any.required': 'PRN is required',
  }),
  email: Joi.string().trim().lowercase().email().max(255).required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/[a-z]/)
    .pattern(/[A-Z]/)
    .pattern(/\d/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters with one uppercase, one lowercase, and one number',
      'string.pattern.base': 'Password must be at least 8 characters with one uppercase, one lowercase, and one number',
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

// email / prn / password cannot be changed through the profile endpoint
const updateProfileSchema = Joi.object(profileFields);

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

module.exports = { registerSchema, updateProfileSchema, loginSchema };
