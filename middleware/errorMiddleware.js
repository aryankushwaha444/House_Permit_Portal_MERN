function notFound(req, res) {
  res.status(404).json({ error: `Not found: ${req.originalUrl}` });
}
function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error(err);
  res
    .status(err.statusCode || 500)
    .json({ error: err.message || "Internal server error" });
}
module.exports = { notFound, errorHandler };
