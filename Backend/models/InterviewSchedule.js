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
      max: 42,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    bookedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 30,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
    collection: "Interview Schedule",
  }
);

module.exports =
  userDatabase.models.InterviewSchedule ||
  userDatabase.model("InterviewSchedule", interviewScheduleSchema);
