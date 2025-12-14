require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const server = http.createServer(app);

// Model Imports
const EnergyReading = require('./models/EnergyReading');
const Alert = require('./models/Alert');

// Middleware
app.use(express.json());
// Allow Angular
app.use(cors({ origin: "http://localhost:4200" })); 
app.use(helmet());
app.use(morgan('common'));

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('IoT Device Connected:', socket.id);
  
  const interval = setInterval(async () => {
    // 1. Generating Data
    const usageValue = Math.floor(Math.random() * 120) + 10; // Increased max to 130 to trigger alerts easier
    const fakeData = {
      sensorId: "Sensor-001",
      usage: usageValue,
      timestamp: new Date()
    };

    // 2. Saving Raw Data
    await EnergyReading.create(fakeData);

    // 3. Checking For THRESHOLD
    if (usageValue > 100) {
      const alertData = {
        sensorId: "Sensor-001",
        value: usageValue,
        threshold: 100,
        message: `CRITICAL LOAD: ${usageValue}kW detected!`
      };

      // A. Saving to DB (Audit Trail)
      await Alert.create(alertData);

      // B. Triggering Special "Alert" Event
      io.emit('alert-incident', alertData); // Broadcast to ALL connected admins
    }

    // 4. Sending Normal Data
    socket.emit('energy-update', fakeData);
  }, 2000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('User disconnected');
  });
});

// Database Connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Atlas Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


// API Endpoint to Get Historical Data
app.get('/api/history', async (req, res) => {
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
app.get('/api/alerts', async (req, res) => {
  const alerts = await Alert.find().sort({ timestamp: -1 }).limit(10);
  res.json(alerts);
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));