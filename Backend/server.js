
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const {
  connectDatabase,
  getDatabaseStatus,
} = require("./config/database");

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

// Validate required environment variables
const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "MONGODB_URI",
];

const missingEnv = requiredEnv.filter(
  (key) => !process.env[key]
);

if (missingEnv.length > 0) {
  console.error(
    `Missing environment variables: ${missingEnv.join(", ")}. Check your Backend/.env file.`
  );
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
  })
);

app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "PrepX backend is running",
  });
});

// Database health endpoint
app.get("/api/health", (req, res) => {
  const database = getDatabaseStatus();
  const connected = database === "connected";

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "degraded",
    database,
  });
});
// Authentication routes
app.use(
  "/api/auth",
  require("./routes/authRoutes")
);
// Cloudinary upload route
app.use(
  "/api/upload",
  require("./routes/uploadRoutes")
);
// Admin routes
app.use(
  "/api/admin",
  require("./routes/adminRoutes")
);
// Error-handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 25 MB."
        : err.message;

    return res.status(400).json({ message });
  }

  if (
    err.message &&
    err.message.startsWith("Unsupported file type")
  ) {
    return res.status(400).json({
      message: err.message,
    });
  }

  console.error("API error:", err.message);

  res.status(500).json({
    message:
      "Something went wrong while processing the request.",
  });
});

// Start server, retrying if the port is occupied
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(
      `PrepX backend running at http://localhost:${port}`
    );
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const fallbackPort = port + 1;

      console.warn(
        `Port ${port} is already in use. Retrying on port ${fallbackPort}...`
      );

      startServer(fallbackPort);
      return;
    }

    console.error(
      "Failed to start server:",
      error.message
    );

    process.exit(1);
  });
}

// Connect to MongoDB before starting the server
async function main() {
  try {
    await connectDatabase();

    console.log("PrepX database is ready.");

    startServer(DEFAULT_PORT);
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
}

main();
