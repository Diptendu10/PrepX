const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const InterviewSchedule = require("../models/InterviewSchedule");
const UserResponse = require("../models/UserResponse");

const router = express.Router();

function toISTDateTimeString(date) {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  return `${new Date(date.getTime() + IST_OFFSET_MS)
    .toISOString()
    .slice(0, -1)}+05:30`;
}

function sortSchedulesByTime(schedules) {
  return schedules.sort(
    (first, second) =>
      new Date(first.scheduledAt).getTime() -
      new Date(second.scheduledAt).getTime()
  );
}

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

function getUserIdFromRequest(req, res) {
  const authorization = req.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Please log in to access your interview responses.",
    });
    return null;
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
      message: "Your session has expired. Please log in again.",
    });
    return null;
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.userId !== "string"
  ) {
    res.status(401).json({
      success: false,
      message: "Invalid user session.",
    });
    return null;
  }

  return payload.userId;
}

async function findUserInterview(interviewId, userId) {
  if (!/^[\da-f]{24}$/i.test(interviewId)) {
    return null;
  }

  return InterviewSchedule.findOne({
    _id: interviewId,
    userId,
  });
}

async function getInterviewResponses(interview, userId) {
  const filter = {
    scheduledInterviewId: interview._id,
    accountId: userId,
  };
  const records = await UserResponse.collection
    .find(filter)
    .sort({ _id: 1 })
    .toArray();

  if (records.length === 0) {
    return [];
  }

  const responses = records.flatMap((record) => [
    ...(Array.isArray(record.responses) ? record.responses : []),
    ...(typeof record.response === "string" ? [record.response] : []),
  ]);
  const [primaryRecord, ...duplicateRecords] = records;

  if (
    records.length !== 1 ||
    !Array.isArray(primaryRecord.responses) ||
    typeof primaryRecord.response === "string"
  ) {
    await UserResponse.collection.updateOne(
      { _id: primaryRecord._id },
      {
        $set: {
          interviewerName: interview.category,
          accountId: interview.userId,
          scheduledInterviewId: interview._id,
          responses,
        },
        $unset: { response: "" },
      }
    );

    if (duplicateRecords.length > 0) {
      await UserResponse.collection.deleteMany({
        _id: { $in: duplicateRecords.map((record) => record._id) },
      });
    }
  }

  return responses;
}

router.get("/", async (req, res) => {
  try {
    if (!verifyAdminRequest(req, res)) {
      return;
    }

    const schedules = sortSchedulesByTime(
      await InterviewSchedule.find().lean()
    );

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

    const schedules = sortSchedulesByTime(
      await InterviewSchedule.find({ userId: payload.userId }).lean()
    );

    return res.status(200).json({ success: true, schedules });
  } catch (error) {
    console.error("User interview schedule retrieval error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load your interview schedule. Please try again.",
    });
  }
});

router.get("/:interviewId/responses", async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) {
      return;
    }

    const interview = await findUserInterview(
      req.params.interviewId,
      userId
    );
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview booking not found.",
      });
    }

    const responses = await getInterviewResponses(interview, userId);

    return res.status(200).json({ success: true, responses });
  } catch (error) {
    console.error("Interview response retrieval error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load your interview responses. Please try again.",
    });
  }
});

router.post("/:interviewId/responses", async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) {
      return;
    }

    const interview = await findUserInterview(
      req.params.interviewId,
      userId
    );
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview booking not found.",
      });
    }

    const response =
      typeof req.body?.response === "string"
        ? req.body.response.trim()
        : "";
    if (response.length === 0 || response.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Responses must be between 1 and 2000 characters.",
      });
    }

    const filter = {
      scheduledInterviewId: interview._id,
      accountId: userId,
    };
    const existing = await UserResponse.collection.findOne(filter);
    if (existing) {
      await getInterviewResponses(interview, userId);
    }

    let updatedRecord;
    try {
      updatedRecord = await UserResponse.findOneAndUpdate(
        filter,
        {
          $setOnInsert: {
            interviewerName: interview.category,
            accountId: interview.userId,
            scheduledInterviewId: interview._id,
          },
          $push: { responses: response },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      ).lean();
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      updatedRecord = await UserResponse.findOneAndUpdate(
        filter,
        { $push: { responses: response } },
        { new: true, runValidators: true }
      ).lean();
    }

    return res.status(201).json({
      success: true,
      response,
      responses: updatedRecord.responses,
    });
  } catch (error) {
    console.error("Interview response save error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to save your response. Please try again.",
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
      categoryId > 100 ||
      typeof category !== "string" ||
      category.trim().length === 0 ||
      category.trim().length > 120 ||
      !["Easy", "Medium", "Hard", "High"].includes(difficulty) ||
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
      scheduledAt: toISTDateTimeString(interviewDateTime),
      bookedAt: toISTDateTimeString(new Date()),
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
