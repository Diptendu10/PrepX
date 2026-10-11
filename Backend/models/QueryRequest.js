const mongoose = require("mongoose");

const ownerDb = mongoose.connection.useDb("Owner");

const queryRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    category: {
      type: String,
      enum: ["account", "interview", "payment"],
      required: true,
    },
    interviewType: {
      type: String,
      enum: ["past", "scheduled"],
      required: function () {
        return this.category === "interview";
      },
    },
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["open", "closed", "resolved"],
      default: "open",
    },
  },
  {
    timestamps: true,
    collection: "User Queries",
  }
);

module.exports =
  ownerDb.models.QueryRequest ||
  ownerDb.model("QueryRequest", queryRequestSchema);
