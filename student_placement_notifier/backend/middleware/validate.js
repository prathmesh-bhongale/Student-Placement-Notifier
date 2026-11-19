const mongoose = require('mongoose');

// validate(schema) -> validates req.body and replaces it with the cleaned value
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: [
        ...new Map(
          error.details.map((d) => {
            const e = { field: d.path.join('.'), message: d.message.replace(/"/g, '') };
            return [`${e.field}|${e.message}`, e];
          })
        ).values(),
      ],
    });
  }
  req.body = value;
  next();
};

const validateObjectId = (param = 'id') => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[param])) {
    return res.status(400).json({ status: 'error', message: 'Invalid drive id' });
  }
  next();
};

module.exports = { validate, validateObjectId };
