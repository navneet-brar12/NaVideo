const express = require("express");
const router = express.Router();
const {
  createMeeting,
  getAllMeetings,
  getMeetingsByUser,
} = require("../controllers/meetingController");
const { protect } = require("../middleware/authMiddleware");

// Create a new meeting
router.post("/create", protect, createMeeting);

// Get all meetings (admin/debug)
router.get("/", getAllMeetings);

// Get user’s own meetings
router.get("/my-meetings", protect, getMeetingsByUser);

module.exports = router;
