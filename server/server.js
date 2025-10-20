import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import socketHandler from "./socket/socketHandler.js";
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "./config/db.js";
import scheduledMeetingRoutes from "./routes/scheduledMeetingRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://localhost:5173",
];

app.use(express.json());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("NaVideo Backend is running successfully!");
});

app.get("/api/users/test", (req, res) => {
  res.json({ message: "Backend working " });
});

app.use("/api/users", userRoutes);

app.use("/api/scheduled-meetings", scheduledMeetingRoutes);

app.use("/api/meetings", meetingRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

socketHandler(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log("Allowed Origins:", allowedOrigins);
});

export default app;
