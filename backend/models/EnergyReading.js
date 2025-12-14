const mongoose = require('mongoose');

const EnergyReadingSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    index: true
  },
  usage: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  //specialized time-series data
  timeseries: {
    timeField: 'timestamp',
    metaField: 'sensorId',
    granularity: 'seconds'
  }
});

//Automatically delete data older than 24 hours (86400 seconds)
//This ensures you never hit the 512MB Free Tier limit.
EnergyReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('EnergyReading', EnergyReadingSchema);