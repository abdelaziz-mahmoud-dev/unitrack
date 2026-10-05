const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
};

module.exports = { notFound, errorHandler };