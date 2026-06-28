const express = require("express");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../Controllers/notificationController");

const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getNotifications);

router.patch("/:id/read", protect, markAsRead);

router.patch("/read-all", protect, markAllAsRead);

module.exports = router;
