const Meeting = require("../models/Meeting");
const { v4: uuidv4 } = require("uuid");

exports.createMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.create({
      meetingId: uuidv4(),
      participants: [],
    });
    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
