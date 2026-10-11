const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const InterviewSchedule = require("../models/InterviewSchedule");

const router = express.Router();

function verifyAdminRequest(req, res) {
  const authorization = req.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Please log in as an admin to view the schedule.",
    });
    return false;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401).json({
      success: false,
      message: "Your admin session has expired. Please log in again.",
    });
    return false;
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    payload.role !== "admin" ||
    typeof payload.adminId !== "string"
  ) {
    res.status(403).json({
      success: false,
      message: "Admin access is required to view the schedule.",
    });
    return false;
  }

  return true;
}

router.get("/", async (req, res) => {
  try {
    if (!verifyAdminRequest(req, res)) {
      return;
    }

    const schedules = await InterviewSchedule.find()
      .sort({ scheduledAt: 1 })
      .lean();

    return res.status(200).json({ success: true, schedules });
  } catch (error) {
    console.error("Interview schedule retrieval error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load the interview schedule. Please try again.",
    });
  }
});

router.get("/mine", async (req, res) => {
  try {
    const authorization = req.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to view your interview schedule.",
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
        message: "Your session has expired. Please log in again.",
      });
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.userId !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session.",
      });
    }

    const schedules = await InterviewSchedule.find({
      userId: payload.userId,
    })
      .sort({ scheduledAt: 1 })
      .lean();

    return res.status(200).json({ success: true, schedules });
  } catch (error) {
    console.error("User interview schedule retrieval error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load your interview schedule. Please try again.",
    });
  }
});

router.post("/book", async (req, res) => {
  try {
    const authorization = req.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to book an interview.",
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
        message: "Your session has expired. Please log in again.",
      });
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.userId !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session.",
      });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unable to verify your account. Please log in again.",
      });
    }

    const {
      categoryId,
      category,
      difficulty,
      scheduledAt,
      scheduledTime,
    } = req.body;
    const interviewDateTime =
      typeof scheduledAt === "string" ? new Date(scheduledAt) : null;
    if (
      !Number.isInteger(categoryId) ||
      categoryId < 1 ||
      categoryId > 42 ||
      typeof category !== "string" ||
      category.trim().length === 0 ||
      category.trim().length > 120 ||
      !["Easy", "Medium", "Hard"].includes(difficulty) ||
      (typeof scheduledTime !== "string" &&
        interviewDateTime &&
        ![0, 30].includes(interviewDateTime.getUTCMinutes())) ||
      (typeof scheduledTime === "string" &&
        !/^(?:[01]\d|2[0-3]):(?:00|30)$/.test(scheduledTime)) ||
      !interviewDateTime ||
      Number.isNaN(interviewDateTime.getTime()) ||
      interviewDateTime.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please choose a valid interview category, difficulty, and future date and time in 30-minute intervals.",
      });
    }

    const booking = await InterviewSchedule.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      categoryId,
      category: category.trim(),
      difficulty,
      scheduledAt: interviewDateTime,
      bookedAt: new Date(),
      durationMinutes: 30,
    });

    return res.status(201).json({
      success: true,
      message: "Your interview has been booked.",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Interview booking error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to book your interview. Please try again.",
    });
  }
});

module.exports = router;
