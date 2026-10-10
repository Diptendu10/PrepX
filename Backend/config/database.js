
const mongoose = require("mongoose");

const connectionStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established successfully.");
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

function getDatabaseStatus() {
  if (!process.env.MONGODB_URI) {
    return "not_configured";
  }

  return (
    connectionStates[mongoose.connection.readyState] || "unknown"
  );
}

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Please configure it in your .env file."
    );
  }
const dns = require("dns");

// Use Google's DNS servers to resolve MongoDB Atlas SRV records.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

const connectionStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

// Connection event listeners
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established successfully.");
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

// Get current database connection status
function getDatabaseStatus() {
  if (!process.env.MONGODB_URI) {
    return "not_configured";
  }

  return (
    connectionStates[mongoose.connection.readyState] || "unknown"
  );
}

// Connect to MongoDB Atlas
async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to your .env file."
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("Connected to MongoDB Atlas successfully.");

    return mongoose.connection;
  } catch (error) {
    console.error(
      "Failed to connect to MongoDB Atlas:",
      error.message
    );

    throw error;
  }
}

// Disconnect from MongoDB
async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected successfully.");
  } catch (error) {
    console.error(
      "Error disconnecting MongoDB:",
      error.message
    );

    throw error;
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
};


  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Connected to MongoDB Atlas.");
    return mongoose.connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB Atlas:", error.message);
    throw error;
  }
}

async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected successfully.");
  } catch (error) {
    console.error("Error disconnecting MongoDB:", error.message);
    throw error;
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
};
