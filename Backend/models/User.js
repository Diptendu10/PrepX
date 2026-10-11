
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    lastQuerySubmittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "details",
  }
);

module.exports = mongoose.model("User", userSchema);
