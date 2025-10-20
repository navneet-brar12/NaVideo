import mongoose from "mongoose";

const ScheduledMeetingSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled meeting" },
    meetingId: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ScheduledMeeting = mongoose.model("ScheduledMeeting", ScheduledMeetingSchema);
export default ScheduledMeeting;
