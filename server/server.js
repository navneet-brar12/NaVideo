// -------------------------
// 📦 Imports
// -------------------------
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import socketHandler from "./socket/socketHandler.js";
import userRoutes from "./routes/userRoutes.js";

// -------------------------
// ⚙️ Configurations
// -------------------------
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL, // e.g. http://localhost:5173
    credentials: true,
  })
);

// Routes
app.use("/api/users", userRoutes);

// -------------------------
// 🧠 MongoDB Connection
// -------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// -------------------------
// 🌐 Express Routes (Optional test route)
// -------------------------
app.get("/", (req, res) => {
  res.send("🚀 NaVideo Backend is running successfully!");
});

// ✅ Add this for testing backend connection
app.get("/api/users/test", (req, res) => {
  res.json({ message: "Backend working ✅" });
});

// -------------------------
// 💬 Socket.io Server Setup
// -------------------------
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Handle all socket-related events
socketHandler(io);

// -------------------------
// 🚀 Start the Server
// -------------------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
