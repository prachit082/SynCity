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
  
  // Sending energy data every 2 seconds
  setInterval(() => {
    const fakeData = {
      sensorId: "Sensor-001",
      // Random val between 10-110
      usage: Math.floor(Math.random() * 100) + 10, 
      timestamp: new Date()
    };
    socket.emit('energy-update', fakeData);
  }, 2000);
});

// Database Connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Atlas Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Basic Route
app.get('/', (req, res) => res.send('Smart City API is Running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));