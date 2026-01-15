// Not found handler
function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found' });
}

// General error handler
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
}

module.exports = { notFound, errorHandler };
