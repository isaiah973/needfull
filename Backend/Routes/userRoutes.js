const express = require("express");
const multer = require("multer");

const {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  resendVerificationCode,
  forgotPassword,
  getProfile,
  getPublicProfile,
  updateProfile,
  changeEmail,
  changePassword,
  getSavedItems,
  resetPassword,
  deleteAccount,
} = require("../Controllers/userController");
const { protect } = require("../Middleware/authMiddleware");

const userRoutes = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
    } else {
      callback(new Error("Profile photo must be an image"));
    }
  },
});

userRoutes.post("/register", registerUser);
userRoutes.post("/verify-email", verifyEmail);
userRoutes.post("/login", loginUser);
userRoutes.post("/logout", logoutUser);
userRoutes.post("/resend-verification-code", resendVerificationCode);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password", resetPassword);
userRoutes.delete("/delete-account", protect, deleteAccount);

userRoutes.get("/profile", protect, getProfile);
userRoutes.get("/public/:id", getPublicProfile);

userRoutes.put("/profile", protect, upload.single("avatar"), updateProfile);
userRoutes.put("/account/email", protect, changeEmail);
userRoutes.put("/account/password", protect, changePassword);

userRoutes.get("/saved-items", protect, getSavedItems);

module.exports = userRoutes;
