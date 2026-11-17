const mongoose = require("mongoose");

const userDatabase = mongoose.connection.useDb("User");

const userResponseSchema = new mongoose.Schema(
  {
    interviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    scheduledInterviewId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    responses: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: false,
    collection: "User Response",
    versionKey: false,
  }
);

userResponseSchema.index(
  { accountId: 1, scheduledInterviewId: 1 },
  {
    unique: true,
    partialFilterExpression: { responses: { $exists: true } },
  }
);

module.exports =
  userDatabase.models.UserResponse ||
  userDatabase.model("UserResponse", userResponseSchema);
