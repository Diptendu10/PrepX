
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const AdminLogin = require("../models/AdminLogin");
const ADMIN_ACCOUNTS = require("../config/adminConfig");

// Generate the current date and time in IST.
function getISTDateTime() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return (
    `${values.year}-${values.month}-${values.day}` +
    `T${values.hour}:${values.minute}:${values.second}+05:30`
  );
}

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { adminId, email, password } = req.body;

    // Validate the required fields.
    if (
      typeof adminId !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin ID, email, and password are required.",
      });
    }

    // Authenticate against backend-defined credentials.
    const admin = ADMIN_ACCOUNTS.find(
      (account) =>
        adminId.trim() === account.adminId &&
        email.trim().toLowerCase() === account.email.toLowerCase() &&
        password === account.password
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    // Record every successful login in Owner -> Login Details.
    const loginDateTime = getISTDateTime();

    await AdminLogin.create({
      adminId: admin.adminId,
      email: admin.email,
      loginDateTime,
    });

    // Never issue a token unless authentication and logging succeed.
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      {
        adminId: admin.adminId,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        adminId: admin.adminId,
        email: admin.email,
      },
      loginDateTime,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete admin login.",
    });
  }
});

module.exports = router;
