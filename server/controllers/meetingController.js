const Meeting = require("../models/Meeting");
const { v4: uuidv4 } = require("uuid");

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.create({
      meetingId: uuidv4(),
      host: req.user ? req.user.id : null,
      participants: [],
    });
    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all meetings (for admin/testing)
exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get meetings by logged-in user
exports.getMeetingsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const meetings = await Meeting.find({ host: userId }).sort({ createdAt: -1 });
    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
