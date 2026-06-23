const mongoose = require("mongoose");
const Item = require("../Models/itemModel");

const createItem = async (req, res) => {
  try {
    const { title, description, category, condition, location } = req.body;

    const item = await Item.create({
      title,
      description,
      category,
      condition,
      location,
      owner: req.user._id,
      images: [],
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
    const items = await Item.find({
      isApproved: true,
      status: "available",
    })
      .populate("owner", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
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
    const item = await Item.findById(req.params.id).populate(
      "owner",
      "name email",
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.views += 1;
    await item.save();

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = req.item; // injected by ownerOnly middleware

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
  getMyItems,
  updateItem,
  deleteItem,
};
