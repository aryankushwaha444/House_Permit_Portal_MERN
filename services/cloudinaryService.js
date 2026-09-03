const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("image/") ? "image" : "raw";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "house-permit-portal",

        resource_type: resourceType,

        use_filename: true,

        unique_filename: true,
      },

      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

module.exports = {
  uploadToCloudinary,
};
