const sanitizeHtml = require('sanitize-html');

// Strip every HTML tag
const clean = (v) =>
  typeof v === 'string'
    ? sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} }).replace(/&amp;/g, '&').trim()
    : v;

// Allow a tiny set of formatting tags
const cleanRich = (v) =>
  sanitizeHtml(v || '', {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {},
  }).trim();

class AppError extends Error {
  constructor(message, statusCode = 400, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { clean, cleanRich, AppError, asyncHandler };
