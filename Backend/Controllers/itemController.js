const mongoose = require("mongoose");
const Item = require("../Models/itemModel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const createItem = async (req, res) => {
  try {
    const { title, description, category, condition, location } = req.body;

    let images = [];

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer)),
      );

      images = uploadedImages.map((img) => img.secure_url);
    }

    const item = await Item.create({
      title,
      description,
      category,
      condition,
      location,
      owner: req.user._id,
      images,
    });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllItems = async (req, res) => {
  try {
    const { search, category, location, condition, sort } = req.query;

    // Base filter
    let filter = {
      moderationStatus: "approved",
      status: "available",
      isActive: true, // hide items from deleted users
    };

    // Search by title
    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by location
    if (location) {
      filter.location = location;
    }

    // Filter by condition
    if (condition) {
      filter.condition = condition;
    }

    let query = Item.find(filter).populate("owner", "name avatar");

    // Sorting
    if (sort === "newest") {
      query = query.sort({ createdAt: -1 });
    } else if (sort === "oldest") {
      query = query.sort({ createdAt: 1 });
    } else {
      // Default: newest first
      query = query.sort({ createdAt: -1 });
    }

    const items = await query;

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("owner", "name avatar");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const recordView = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      views: item.views,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = req.item; // injected by ownerOnly middleware

    // Prevent updating inactive items
    if (!item.isActive) {
      return res.status(400).json({
        success: false,
        message: "This item is no longer active and cannot be updated.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "condition",
      "location",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Item deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getSingleItem,
  recordView,
  getMyItems,
  updateItem,
  deleteItem,
};
