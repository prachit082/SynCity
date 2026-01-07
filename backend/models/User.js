const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "staff"],
    default: "staff",
  },
  avatarSeed: { type: String, default: "default" },
  theme: { type: String, enum: ["light", "dark"], default: "light" },
});

module.exports = mongoose.model("User", UserSchema);
