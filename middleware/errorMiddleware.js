function notFound(req, res) {
  res.status(404).json({
    error: `Not found: ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars

  console.error(err);

  // Multer: file exceeds 700 KB
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File size must not exceed 700 KB per file.",
    });
  }

  res
    .status(err.statusCode || 500)
    .json({ error: err.message || "Internal server error" });
}

module.exports = { notFound, errorHandler };
