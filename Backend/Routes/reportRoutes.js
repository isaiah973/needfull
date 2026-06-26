const express = require("express");

const {
  createReport,
  getAllReports,
  getSingleReport,
  resolveReport,
  dismissReport,
} = require("../Controllers/reportController");

const { protect } = require("../Middleware/authMiddleware");
const { adminOnly, superAdminOnly } = require("../Middleware/adminMiddleware");

const router = express.Router();

// User
router.post("/:id", protect, createReport);

// Admin
router.get("/", protect, adminOnly, getAllReports);
router.get("/:id", protect, adminOnly, getSingleReport);

router.patch("/:id/resolve", protect, adminOnly, resolveReport);
router.patch("/:id/dismiss", protect, adminOnly, dismissReport);

module.exports = router;
