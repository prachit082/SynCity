require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);

let systemState = {
  isActive: true,
  // Default is 100kW
  alertThreshold: 100,
};

// Model Imports
const EnergyReading = require("./models/EnergyReading");
const Alert = require("./models/Alert");
const User = require("./models/User");

// Middleware
app.use(express.json());
// Allow Angular
app.use(cors({ origin: "http://localhost:4200" }));
app.use(helmet());
app.use(morgan("common"));

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("IoT Device Connected:", socket.id);

  /// 1. Sending FULL State on connection
  socket.emit("system-state", systemState);

  // 2. Handle Master Switch
  socket.on("toggle-system", (command) => {
    systemState.isActive = command === "START";
    io.emit("system-state", systemState); // Broadcast to everyone
  });

  // 3. NEW: Handle Threshold Change
  socket.on("update-threshold", (newLimit) => {
    systemState.alertThreshold = parseInt(newLimit);
    console.log(`Admin updated threshold to: ${systemState.alertThreshold}kW`);
    io.emit("system-state", systemState);
  });

  let sensorCounter = 1;

  const interval = setInterval(async () => {
    // 3. ONLY Generating data if system is ACTIVE
    if (!systemState.isActive) return;
    const usageValue = Math.floor(Math.random() * 120) + 10;
    const sensorId = `Sensor-${String(sensorCounter).padStart(3, "0")}`;
    sensorCounter += 1;
    const fakeData = {
      sensorId: sensorId,
      usage: usageValue,
      timestamp: new Date(),
    };

    // Saving Raw Data
    await EnergyReading.create(fakeData);

    // Checking For THRESHOLD
    if (usageValue > systemState.alertThreshold) {
      const alertData = {
        sensorId: sensorId,
        value: usageValue,
        threshold: systemState.alertThreshold,
        message: `CRITICAL LOAD: ${usageValue}kW detected!`,
      };

      // A. Saving to DB (Audit Trail)
      await Alert.create(alertData);

      // B. Triggering Special "Alert" Event
      io.emit("alert-incident", alertData); // Broadcast to ALL connected admins
    }

    // 4. Sending Normal Data
    socket.emit("energy-update", fakeData);
  }, 2000);

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("User disconnected");
  });
});

const JWT_SECRET = process.env.JWT_SECRET;

// Database Connection
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Atlas Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- AUTH ROUTE: REGISTER ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || "staff",
    });

    res.json({ message: "User created!", userId: user._id });
  } catch (err) {
    res.status(400).json({ error: "Username likely exists already" });
  }
});

// --- AUTH ROUTE: LOGIN ---
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  // 1. Finding User
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  // 2. Checking Password
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ error: "Invalid password" });

  // 3. Generating Token
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token, role: user.role, username: user.username });
});

// API Endpoint to Get Historical Data
app.get("/api/history", async (req, res) => {
  try {
    // last 50 readings, sorted by newest first
    const history = await EnergyReading.find()
      .sort({ timestamp: -1 })
      .limit(50);

    // Reversing it so the chart shows Oldest -> Newest (Left to Right)
    res.json(history.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoint to Get Past Alerts
app.get("/api/alerts", async (req, res) => {
  const alerts = await Alert.find().sort({ timestamp: -1 }).limit(10);
  res.json(alerts);
});

// API Endpoint to Get Past 500 Alerts for export
app.get("/api/reports/export", async (req, res) => {
  try {
    const data = await EnergyReading.find()
      .sort({ timestamp: -1 })
      .limit(500)
      .lean();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
