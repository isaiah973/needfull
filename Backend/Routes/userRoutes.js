const express = require("express");

const {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  resendVerificationCode,
  forgotPassword,
  getProfile,
  updateProfile,
  getSavedItems,
  resetPassword,
} = require("../Controllers/userController");
const { protect } = require("../Middleware/authMiddleware");

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/verify-email", verifyEmail);
userRoutes.post("/login", loginUser);
userRoutes.post("/logout", logoutUser);
userRoutes.post("/resend-verification-code", resendVerificationCode);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password", resetPassword);

userRoutes.get("/profile", protect, getProfile);

userRoutes.put("/profile", protect, updateProfile);

userRoutes.get("/saved-items", protect, getSavedItems);

module.exports = userRoutes;
