const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  author: String,
  message: String,
  role: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Note", NoteSchema);
