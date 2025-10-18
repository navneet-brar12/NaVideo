// -----------------------------
// 📦 Imports
// -----------------------------
import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

// -----------------------------
// ⚙️ Setup Router
// -----------------------------
const router = express.Router();

// ✅ Temporary test route (to check backend connectivity)
router.get("/test", (req, res) => {
  res.json({ message: "Backend working ✅" });
});

// -----------------------------
// 🌐 Public Routes
// -----------------------------
router.post("/register", registerUser);
router.post("/login", loginUser);

// -----------------------------
// 🔐 Protected Route
// -----------------------------
router.get("/profile", protect, getUserProfile);

// -----------------------------
// 📤 Export Router
// -----------------------------
export default router;
