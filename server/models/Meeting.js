const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, unique: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [{ type: String }],
    scheduledFor: { type: Date }, 
    title: { type: String }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
