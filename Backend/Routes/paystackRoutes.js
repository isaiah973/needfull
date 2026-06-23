const express = require("express");
const {
  initializePayment,
  verifyPayment,
  handleWebhook,
} = require("../Controllers/paystackController");
const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();

// logged-in checkout
router.post("/initialize", protect, initializePayment);

// frontend can call this after redirect
router.get("/verify/:reference", protect, verifyPayment);

// webhook from paystack
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

module.exports = router;
