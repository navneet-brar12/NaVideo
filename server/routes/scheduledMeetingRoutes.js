import express from "express";
import {
  createScheduledMeeting,
  getAllScheduledMeetings,
  deleteScheduledMeeting,
} from "../controllers/scheduledMeetingController.js";

const router = express.Router();

router.post("/create", createScheduledMeeting);
router.get("/", getAllScheduledMeetings);
router.delete("/:id", deleteScheduledMeeting);

export default router;
