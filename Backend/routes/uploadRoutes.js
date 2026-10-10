const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB starting limit
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(
        new Error("Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4, WEBM, or MOV.")
      );
    }
    callback(null, true);
  }
});

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file received. Send a file using the form field named "file".'
      });
    }

    const resourceType = req.file.mimetype.startsWith("video/")
      ? "video"
      : "image";

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "prepx",
          resource_type: resourceType
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );

      stream.end(req.file.buffer);
    });

    return res.status(201).json({
      message: "Upload successful",
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
