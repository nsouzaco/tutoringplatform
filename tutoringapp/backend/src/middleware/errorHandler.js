/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message,
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
  });
};

/**
 * 404 handler for unknown routes
 */
const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
};

module.exports = {
  errorHandler,
  notFound,
};

