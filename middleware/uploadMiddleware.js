const multer = require("multer");

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, JPG, JPEG, PNG and WEBP files are allowed."
      )
    );
  }
};

const upload = multer({
  storage,

  limits: {
    fileSize: 700 * 1024,
  },

  fileFilter,
});

module.exports = upload;
