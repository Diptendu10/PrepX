const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const QueryRequest = require("../models/QueryRequest");

const router = express.Router();
const queryFeedback = new Map();
const QUERY_COOLDOWN_MS = 12 * 60 * 60 * 1000;

function sendQueryCooldownResponse(res, lastSubmittedAt) {
  const retryAfterMs =
    new Date(lastSubmittedAt).getTime() + QUERY_COOLDOWN_MS - Date.now();
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  const totalMinutes = Math.ceil(retryAfterSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const waitTime = [
    hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "",
    minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : "",
  ]
    .filter(Boolean)
    .join(" and ");

  res.set("Retry-After", String(retryAfterSeconds));
  return res.status(429).json({
    success: false,
    message: `You can submit another query in ${waitTime}.`,
    retryAfterSeconds,
  });
}

function verifyAdminRequest(req, res) {
  const authorization = req.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Please log in as an admin to view queries.",
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
      message: "Admin access is required to view queries.",
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

    const savedQueries = await QueryRequest.find()
      .sort({ createdAt: -1 })
      .lean();
    const queries = savedQueries.map((query) => ({
      ...query,
      feedback: queryFeedback.get(query._id.toString())?.message || null,
    }));

    return res.status(200).json({
      success: true,
      queries,
    });
  } catch (error) {
    console.error("Query retrieval error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load user queries. Please try again.",
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
        message: "Please log in to view your query solutions.",
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

    const userQueries = await QueryRequest.find({ user: payload.userId })
      .sort({ createdAt: -1 })
      .lean();

    const queries = userQueries.map((query) => ({
      _id: query._id,
      category: query.category,
      interviewType: query.interviewType,
      question: query.question,
      status: query.status,
      createdAt: query.createdAt,
      solution: queryFeedback.get(query._id.toString())?.message || null,
    }));

    return res.status(200).json({
      success: true,
      queries,
    });
  } catch (error) {
    console.error("User query retrieval error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your query solutions. Please try again.",
    });
  }
});

router.post("/:queryId/feedback", async (req, res) => {
  try {
    if (!verifyAdminRequest(req, res)) {
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.queryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid query ID.",
      });
    }

    const { message } = req.body;
    if (
      typeof message !== "string" ||
      message.trim().length === 0 ||
      message.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be between 1 and 2000 characters.",
      });
    }

    const query = await QueryRequest.findById(req.params.queryId);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found.",
      });
    }

    query.status = "closed";
    await query.save();

    const feedback = message.trim();
    queryFeedback.set(query._id.toString(), {
      message: feedback,
    });

    return res.status(200).json({
      success: true,
      message: "Feedback sent and query closed.",
      feedback,
    });
  } catch (error) {
    console.error("Query feedback submission error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send feedback. Please try again.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const authorization = req.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to submit a query.",
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

    const { category, interviewType, question } = req.body;

    if (
      !["account", "interview", "payment"].includes(category) ||
      typeof question !== "string" ||
      question.trim().length === 0 ||
      question.trim().length > 2000 ||
      (category === "interview" &&
        !["past", "scheduled"].includes(interviewType))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid query category and question.",
      });
    }

    const latestQuery = await QueryRequest.findOne({ user: user._id })
      .sort({ createdAt: -1 })
      .select("createdAt")
      .lean();
    const lastSubmittedAt = [
      user.lastQuerySubmittedAt,
      latestQuery?.createdAt,
    ]
      .filter(Boolean)
      .sort((first, second) => second.getTime() - first.getTime())[0];
    const now = new Date();

    if (
      lastSubmittedAt &&
      now.getTime() - lastSubmittedAt.getTime() < QUERY_COOLDOWN_MS
    ) {
      return sendQueryCooldownResponse(res, lastSubmittedAt);
    }

    const cooldownCutoff = new Date(now.getTime() - QUERY_COOLDOWN_MS);
    const claimedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        $or: [
          { lastQuerySubmittedAt: null },
          { lastQuerySubmittedAt: { $exists: false } },
          { lastQuerySubmittedAt: { $lte: cooldownCutoff } },
        ],
      },
      { $set: { lastQuerySubmittedAt: now } },
      { new: true }
    );

    if (!claimedUser) {
      const currentUser = await User.findById(user._id).select(
        "lastQuerySubmittedAt"
      );
      return sendQueryCooldownResponse(
        res,
        currentUser?.lastQuerySubmittedAt || now
      );
    }

    let queryRequest;
    try {
      queryRequest = await QueryRequest.create({
        user: user._id,
        userName: user.name,
        userEmail: user.email,
        category,
        ...(category === "interview" ? { interviewType } : {}),
        question: question.trim(),
      });
    } catch (error) {
      await User.updateOne(
        { _id: user._id, lastQuerySubmittedAt: now },
        user.lastQuerySubmittedAt
          ? { $set: { lastQuerySubmittedAt: user.lastQuerySubmittedAt } }
          : { $unset: { lastQuerySubmittedAt: 1 } }
      );
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Your query has been submitted.",
      queryId: queryRequest._id,
    });
  } catch (error) {
    console.error("Query submission error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your query. Please try again.",
    });
  }
});

module.exports = router;
