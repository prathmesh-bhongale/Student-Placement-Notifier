const Joi = require('joi');

const localToday = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const percent = (label) =>
  Joi.number().min(0).max(100).allow(null).messages({
    'number.base': `${label} must be a number`,
    'number.min': `${label} must be between 0 and 100`,
    'number.max': `${label} must be between 0 and 100`,
  });

const driveSchema = Joi.object({
  companyName: Joi.string().trim().min(2).max(150).required().messages({
    'string.min': 'Company name must be at least 2 characters',
    'string.empty': 'Company name is required',
    'any.required': 'Company name is required',
  }),
  jobPosts: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().required().messages({
          'string.empty': 'Job title is required',
          'any.required': 'Job title is required',
        }),
        vacancies: Joi.number().integer().min(1).required().messages({
          'number.min': 'Vacancies must be at least 1',
          'number.base': 'Vacancies must be a number',
          'number.integer': 'Vacancies must be a whole number',
          'any.required': 'Vacancies is required',
        }),
      })
    )
    .min(1)
    .required()
    .messages({ 'array.min': 'At least one job post is required', 'any.required': 'At least one job post is required' }),
  eligibilityCriteria: Joi.object({
    minPercent10: percent('Minimum 10th percentage'),
    minPercent12: percent('Minimum 12th percentage'),
    minDiplomaPercent: percent('Minimum diploma percentage'),
    minSem6Percent: percent('Minimum semester 6 percentage'),
    maxBacklogs: Joi.number().integer().min(0).default(0).messages({
      'number.min': 'Maximum backlogs cannot be negative',
      'number.base': 'Maximum backlogs must be a number',
    }),
    requiredSkills: Joi.array().items(Joi.string().trim().min(1).max(60)).default([]),
  }).default({ maxBacklogs: 0, requiredSkills: [] }),
  jobDescription: Joi.string().trim().min(10).required().messages({
    'string.min': 'Job description must be at least 10 characters',
    'string.empty': 'Job description is required',
    'any.required': 'Job description is required',
  }),
  location: Joi.string().trim().required().messages({
    'string.empty': 'Location is required',
    'any.required': 'Location is required',
  }),
  driveDate: Joi.date()
    .iso()
    .required()
    .custom((value, helpers) => {
      if (value.toISOString().slice(0, 10) < localToday()) {
        return helpers.message('Drive date must be today or in the future');
      }
      return value;
    })
    .messages({ 'date.base': 'Drive date must be a valid date', 'date.format': 'Drive date must be a valid date', 'any.required': 'Drive date is required' }),
  applyLink: Joi.string().trim().uri({ scheme: ['http', 'https'] }).allow('', null).messages({
    'string.uri': 'Apply link must be a valid URL',
    'string.uriCustomScheme': 'Apply link must be a valid URL',
  }),
  status: Joi.string().valid('active', 'closed', 'upcoming').default('upcoming'),
  notifyStudents: Joi.boolean().default(false),
});

// When editing, the date may already be in the past (e.g. to close an old drive)
const updateDriveSchema = driveSchema.fork('driveDate', () =>
  Joi.date().iso().required().messages({
    'date.base': 'Drive date must be a valid date',
    'date.format': 'Drive date must be a valid date',
    'any.required': 'Drive date is required',
  })
);

module.exports = { driveSchema, updateDriveSchema };
