
const mongoose = require("mongoose");

// Use the existing MongoDB connection and select the Owner database.
const ownerDb = mongoose.connection.useDb("Owner");

const adminLoginSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    loginDateTime: {
      type: String,
      required: true,
    },
  },
  {
    collection: "Login Details",
    versionKey: false,
  }
);

const AdminLogin =
  ownerDb.models.AdminLogin ||
  ownerDb.model("AdminLogin", adminLoginSchema);

module.exports = AdminLogin;
