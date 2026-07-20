const express = require("express");
const multer = require("multer");

const {
  createItem,
  getAllItems,
  getSingleItem,
  recordView,
  updateItem,
  deleteItem,
  getMyItems,
} = require("../controllers/itemController");

const {
  createRequest,
  getRequestStatus,
} = require("../controllers/requestController");

const { saveItem, removeSavedItem } = require("../controllers/userController");

const { protect, protectOptional } = require("../Middleware/authMiddleware");
const ownerOnly = require("../Middleware/ownerOnly");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/my-items", protect, getMyItems);
router.get("/", getAllItems);

router.post("/create", protect, upload.array("images", 5), createItem);

router.post("/:id/view", protectOptional, recordView);

router.get("/:id/request-status", protect, getRequestStatus);

router.get("/:id", getSingleItem);

router.put("/:id", protect, ownerOnly, upload.array("images", 5), updateItem);

router.delete("/:id", protect, ownerOnly, deleteItem);

router.post("/:id/save", protect, saveItem);
router.delete("/:id/save", protect, removeSavedItem);

router.post("/:id/request", protect, createRequest);

module.exports = router;
