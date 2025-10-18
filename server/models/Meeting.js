const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, unique: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [{ type: String }], // store socket IDs or usernames
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
