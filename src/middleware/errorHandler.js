const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Multer errors — file too large or invalid type
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File too large. Maximum size is 10MB.'
      : err.message;
    return res.status(400).json({ status: 'error', message });
  }

  // Custom fileFilter rejection from upload middleware
  if (err.message && err.message.startsWith('Invalid file type')) {
    return res.status(400).json({ status: 'error', message: err.message });
  }

  // Sequelize unique constraint — 409 Conflict
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status: 'error',
      message: err.errors?.[0]?.message || 'Duplicate entry',
    });
  }

  // Sequelize validation errors — 422 Unprocessable Entity
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // JWT errors — handled in authenticate.js but caught here as fallback
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return res.status(statusCode).json({ status: 'error', message });
};

module.exports = errorHandler;
