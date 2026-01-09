const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  role: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
