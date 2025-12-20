const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
  sensorId: String,
  value: Number,
  threshold: Number,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
    // Deleting after 7 days
    expires: 604800,
  },
  status: {
    type: String,
    enum: ["Open", "Investigating", "Resolved"],
    default: "Open",
  },
  resolvedBy: { type: String, default: null },
  resolutionNote: { type: String, default: null },
  resolvedAt: { type: Date },
});

module.exports = mongoose.model("Alert", AlertSchema);
