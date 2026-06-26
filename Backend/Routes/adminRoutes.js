const express = require("express");

const {
  getDashboard,

  getAllUsers,
  getSingleUser,
  suspendUser,
  unsuspendUser,

  getAllItems,
  deleteItem,

  getAllRequests,
  cancelRequest,
  completeRequest,

  makeAdmin,
  removeAdmin,
} = require("../Controllers/adminController");

const { protect } = require("../Middleware/authMiddleware");

const { adminOnly, superAdminOnly } = require("../Middleware/adminMiddleware");

const router = express.Router();

// =======================
// Dashboard
// =======================

router.get("/dashboard", protect, adminOnly, getDashboard);

// =======================
// Users
// =======================

router.get("/users", protect, adminOnly, getAllUsers);

router.get("/users/:id", protect, adminOnly, getSingleUser);

router.patch("/users/:id/suspend", protect, adminOnly, suspendUser);

router.patch("/users/:id/unsuspend", protect, adminOnly, unsuspendUser);

// =======================
// Super Admin
// =======================

router.patch("/users/:id/make-admin", protect, superAdminOnly, makeAdmin);

router.patch("/users/:id/remove-admin", protect, superAdminOnly, removeAdmin);

// =======================
// Items
// =======================

router.get("/items", protect, adminOnly, getAllItems);

router.delete("/items/:id", protect, adminOnly, deleteItem);

// =======================
// Requests
// =======================

router.get("/requests", protect, adminOnly, getAllRequests);

router.patch("/requests/:id/cancel", protect, adminOnly, cancelRequest);

router.patch("/requests/:id/complete", protect, adminOnly, completeRequest);

module.exports = router;
