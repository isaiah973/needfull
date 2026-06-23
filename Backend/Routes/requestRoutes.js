const express = require("express");

const {
  createRequest,
  getMyRequests,
  getReceivedRequests,
  approveRequest,
  rejectRequest,
  completeRequest,
} = require("../Controllers/requestController");

const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/:itemId", protect, createRequest);

router.get("/my-requests", protect, getMyRequests);

router.get("/received", protect, getReceivedRequests);

router.patch("/:id/approve", protect, approveRequest);

router.patch("/:id/reject", protect, rejectRequest);

router.patch("/:id/complete", protect, completeRequest);

module.exports = router;
