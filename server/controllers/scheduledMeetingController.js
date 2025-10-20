import { v4 as uuidv4 } from "uuid";
import Meeting from "../models/Meeting.js";

export const createScheduledMeeting = async (req, res) => {
  try {
    const { title, description, dateTime } = req.body;
    const meeting = await Meeting.create({
      meetingId: uuidv4(),
      title,
      description,
      dateTime,
      participants: [],
    });
    res.json({ success: true, meeting });
  } catch (err) {
    console.error("Error scheduling meeting:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllScheduledMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteScheduledMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Meeting.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }
    res.json({ success: true, message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
