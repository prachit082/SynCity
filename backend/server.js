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

const EnergyReading = require('./models/EnergyReading');

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
    const fakeData = {
      sensorId: "Sensor-001",
      usage: Math.floor(Math.random() * 100) + 10,
      timestamp: new Date()
    };

    // 1. Save to Database
    try {
      await EnergyReading.create(fakeData);
    } catch (err) {
      console.error("DB Save Error:", err);
    }

    // 2. Send to Frontend
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


// API Endpoint to get historical data
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

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));