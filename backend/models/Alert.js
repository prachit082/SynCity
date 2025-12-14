const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  sensorId: String,
  value: Number,
  threshold: Number,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
    // Deleting after 7 days
    expires: 604800 
  }
});

module.exports = mongoose.model('Alert', AlertSchema);