const express = require("express");
const router = express.Router();
const { createMeeting, getAllMeetings } = require("../controllers/meetingController");

router.post("/create", createMeeting);
router.get("/", getAllMeetings);

module.exports = router;
