const mongoose = require("mongoose");

const userDatabase = mongoose.connection.useDb("User");

const interviewScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    categoryId: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "High"],
      required: true,
    },
    scheduledAt: {
      type: String,
      required: true,
    },
    bookedAt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: false,
    collection: "Interview Schedule",
  }
);

module.exports =
  userDatabase.models.InterviewSchedule ||
  userDatabase.model("InterviewSchedule", interviewScheduleSchema);
