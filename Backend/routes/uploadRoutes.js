const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const InterviewSchedule = require("../models/InterviewSchedule");

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

const MAX_CV_SIZE = 1024 * 1024;
const uploadCv = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_CV_SIZE,
    files: 1
  }
}).single("file");

router.post("/cv", (req, res, next) => {
  uploadCv(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Your CV must be a PDF smaller than 1 MB."
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Unable to process the CV file."
      });
    }

    next();
  });
}, async (req, res) => {
  try {
    const authorization = req.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to submit your CV."
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again."
      });
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.userId !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session."
      });
    }

    if (!req.file || req.file.size >= MAX_CV_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Your CV must be a PDF smaller than 1 MB."
      });
    }

    if (
      req.file.mimetype !== "application/pdf" ||
      !req.file.originalname.toLowerCase().endsWith(".pdf") ||
      req.file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only valid PDF files can be submitted as a CV."
      });
    }

    const interviewId = req.body.interviewId;
    if (!/^[\da-f]{24}$/i.test(interviewId || "")) {
      return res.status(400).json({
        success: false,
        message: "A valid scheduled interview is required to submit a CV."
      });
    }

    const interview = await InterviewSchedule.findOne({
      _id: interviewId,
      userId: payload.userId
    });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview booking not found."
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "prepx/cvs",
          resource_type: "raw",
          format: "pdf"
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );

      stream.end(req.file.buffer);
    });

    return res.status(201).json({
      success: true,
      message: "CV submitted successfully.",
      url: result.secure_url
    });
  } catch (error) {
    console.error("CV upload error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to submit your CV. Please try again."
    });
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
