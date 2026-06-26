const mongoose = require("mongoose");

const User = require("../Models/userModel");
const Item = require("../Models/itemModel");
const Request = require("../Models/requestModel");
const Report = require("../Models/reportModel");

// =============================
// Dashboard
// =============================

const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalItems,
      availableItems,
      reservedItems,
      givenItems,
      totalRequests,
      pendingRequests,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ status: "available" }),
      Item.countDocuments({ status: "reserved" }),
      Item.countDocuments({ status: "given" }),
      Request.countDocuments(),
      Request.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "pending" }),
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalItems,
        availableItems,
        reservedItems,
        givenItems,
        totalRequests,
        pendingRequests,
        pendingReports,
      },
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

// =============================
// USERS
// =============================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot suspend a superadmin",
      });
    }

    user.isSuspended = true;
    user.suspendedAt = new Date();
    user.suspensionReason = reason || "";

    await user.save();

    res.status(200).json({
      success: true,
      message: "User suspended successfully",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to suspend user",
    });
  }
};

const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isSuspended = false;
    user.suspendedAt = null;
    user.suspensionReason = "";

    await user.save();

    res.status(200).json({
      success: true,
      message: "User unsuspended successfully",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to unsuspend user",
    });
  }
};

// =============================
// ITEMS
// =============================

const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch items",
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
};

// =============================
// REQUESTS
// =============================

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("item", "title")
      .populate("requester", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
    });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "cancelled";

    await request.save();

    res.status(200).json({
      success: true,
      message: "Request cancelled successfully",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to cancel request",
    });
  }
};

const completeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "completed";

    await request.save();

    await Item.findByIdAndUpdate(request.item, {
      status: "given",
    });

    res.status(200).json({
      success: true,
      message: "Request completed successfully",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to complete request",
    });
  }
};

// =============================
// SUPER ADMIN
// =============================

const makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "User is already an admin.",
      });
    }

    if (user.role === "superadmin") {
      return res.status(400).json({
        success: false,
        message: "User is already a superadmin.",
      });
    }

    user.role = "admin";

    await user.save();

    res.status(200).json({
      success: true,
      message: "User promoted to admin",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to promote user",
    });
  }
};
const removeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot modify a superadmin",
      });
    }

    if (user.role === "user") {
      return res.status(400).json({
        success: false,
        message: "User is not an admin.",
      });
    }

    user.role = "user";

    await user.save();

    res.status(200).json({
      success: true,
      message: "Admin removed successfully",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to remove admin",
    });
  }
};

module.exports = {
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
};
