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
    origin: process.env.CLIENT_URL || "*", // fallback for Vercel
    credentials: true,
  })
);

// -------------------------
// 🧠 MongoDB Connection
// -------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// -------------------------
// 🌐 Routes
// -------------------------
app.get("/", (req, res) => {
  res.send("🚀 NaVideo Backend is running successfully!");
});

app.get("/api/users/test", (req, res) => {
  res.json({ message: "Backend working ✅" });
});

app.use("/api/users", userRoutes);

// -------------------------
// 💬 Socket.io Setup
// -------------------------
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Handle all socket events
socketHandler(io);

// -------------------------
// 🚀 Server / Export for Vercel
// -------------------------
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () =>
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  );
}

// ✅ Export for Vercel serverless function
export default app;
