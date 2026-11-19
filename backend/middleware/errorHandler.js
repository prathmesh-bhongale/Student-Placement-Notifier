const notFound = (req, res) =>
  res.status(404).json({ status: 'error', message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';
  const errors = err.errors;

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token. Please log in again.';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'A record with this PRN or email already exists';
  } else if (err.name === 'SequelizeValidationError' || err.name === 'ValidationError') {
    status = 400;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }

  if (status >= 500) console.error('❌', err);
  if (status >= 500 && process.env.NODE_ENV === 'production') message = 'Internal server error';

  res.status(status).json({ status: 'error', message, ...(errors ? { errors } : {}) });
};

module.exports = { notFound, errorHandler };
