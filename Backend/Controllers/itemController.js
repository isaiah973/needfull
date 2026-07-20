const mongoose = require("mongoose");
const Item = require("../Models/itemModel");
const Notification = require("../Models/notificationModel");
const Report = require("../Models/reportModel");
const Request = require("../Models/requestModel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const MAX_DESCRIPTION_WORDS = 150;
const MAX_DESCRIPTION_CHARACTERS = 1000;
const MAX_TITLE_LENGTH = 70;
const MAX_LOCATION_LENGTH = 80;
const MAX_ITEM_IMAGES = 5;
const countWords = (value = "") =>
  value.trim() ? value.trim().split(/\s+/).length : 0;
const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateDescription = (description) => {
  if (!description?.trim()) return "Description is required";
  if (countWords(description) > MAX_DESCRIPTION_WORDS) {
    return `Description cannot exceed ${MAX_DESCRIPTION_WORDS} words`;
  }
  if (description.length > MAX_DESCRIPTION_CHARACTERS) {
    return `Description cannot exceed ${MAX_DESCRIPTION_CHARACTERS.toLocaleString()} characters`;
  }
  return "";
};

const validateItemText = ({ title, location }) => {
  if (!title?.trim()) return "Item title is required";
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return `Item title cannot exceed ${MAX_TITLE_LENGTH} characters`;
  }
  return validateLocation(location);
};

const validateLocation = (location) => {
  if (!location?.trim()) return "Pickup location is required";
  if (location.trim().length > MAX_LOCATION_LENGTH) {
    return `Pickup location cannot exceed ${MAX_LOCATION_LENGTH} characters`;
  }
  return "";
};

const parseExistingImages = (value) => {
  const parsedImages = JSON.parse(value);

  if (!Array.isArray(parsedImages)) {
    throw new Error("Existing images must be an array");
  }

  return parsedImages;
};

const arraysMatch = (left = [], right = []) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const createItem = async (req, res) => {
  try {
    const { title, description, category, condition, location } = req.body;
    const itemTextError = validateItemText({ title, location });
    const descriptionError = validateDescription(description);

    if (itemTextError || descriptionError) {
      return res.status(400).json({
        success: false,
        message: itemTextError || descriptionError,
      });
    }

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
    if (search?.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by location
    if (location?.trim()) {
      filter.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i",
      };
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
    } else if (sort === "popular") {
      query = query.sort({ views: -1, createdAt: -1 });
    } else if (sort === "requested") {
      query = query.sort({ requestCount: -1, createdAt: -1 });
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

    if (!item.contentLockedAt) {
      const hasReceivedRequest =
        item.requestCount > 0 ||
        Boolean(await Request.exists({ item: item._id }));

      if (hasReceivedRequest) {
        item.contentLockedAt = new Date();
        await Item.updateOne(
          { _id: item._id, contentLockedAt: null },
          { $set: { contentLockedAt: item.contentLockedAt } },
        );
      }
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
    let item;
    let counted = true;

    if (req.user) {
      item = await Item.findOneAndUpdate(
        {
          _id: req.params.id,
          isActive: true,
          viewedBy: { $ne: req.user._id },
        },
        {
          $addToSet: { viewedBy: req.user._id },
          $inc: { views: 1 },
        },
        { new: true },
      );

      if (!item) {
        item = await Item.findOne({
          _id: req.params.id,
          isActive: true,
        }).select("views");
        counted = false;
      }
    } else {
      item = await Item.findOneAndUpdate(
        { _id: req.params.id, isActive: true },
        { $inc: { views: 1 } },
        { new: true },
      );
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      views: item.views,
      counted,
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
    const hasExistingRequest = await Request.exists({ item: item._id });
    const contentLocked = Boolean(
      item.contentLockedAt || item.requestCount > 0 || hasExistingRequest,
    );

    if (contentLocked && !item.contentLockedAt) {
      item.contentLockedAt = new Date();
    }

    // Prevent updating inactive items
    if (!item.isActive) {
      return res.status(400).json({
        success: false,
        message: "This item is no longer active and cannot be updated.",
      });
    }

    if (contentLocked) {
      let requestedExistingImages = item.images || [];

      if (req.body.existingImages !== undefined) {
        try {
          requestedExistingImages = parseExistingImages(
            req.body.existingImages,
          );
        } catch {
          return res.status(400).json({
            success: false,
            message: "Invalid existing image selection",
          });
        }
      }

      const lockedContentChanged =
        (req.body.title !== undefined &&
          req.body.title.trim() !== item.title) ||
        (req.body.category !== undefined &&
          req.body.category !== item.category) ||
        (req.body.condition !== undefined &&
          req.body.condition !== item.condition) ||
        (req.body.description !== undefined &&
          req.body.description.trim() !== item.description) ||
        !arraysMatch(requestedExistingImages, item.images || []) ||
        Boolean(req.files?.length);

      if (lockedContentChanged) {
        return res.status(409).json({
          success: false,
          message:
            "This item has received a request. Its pictures and core details can no longer be changed.",
        });
      }
    }

    if (req.body.description !== undefined) {
      const descriptionError = validateDescription(req.body.description);

      if (descriptionError) {
        return res.status(400).json({
          success: false,
          message: descriptionError,
        });
      }
    }

    const nextTitle = req.body.title ?? item.title;
    const nextLocation = req.body.location ?? item.location;
    const itemTextError = contentLocked
      ? validateLocation(nextLocation)
      : validateItemText({
          title: nextTitle,
          location: nextLocation,
        });

    if (itemTextError) {
      return res.status(400).json({
        success: false,
        message: itemTextError,
      });
    }

    const allowedFields = contentLocked
      ? ["location", "status"]
      : [
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

    if (
      !contentLocked &&
      (req.body.existingImages !== undefined || req.files?.length)
    ) {
      let existingImages = item.images || [];

      if (req.body.existingImages !== undefined) {
        try {
          const parsedImages = parseExistingImages(req.body.existingImages);

          const currentImages = new Set(item.images || []);
          existingImages = parsedImages.filter(
            (image) =>
              typeof image === "string" && currentImages.has(image),
          );
        } catch {
          return res.status(400).json({
            success: false,
            message: "Invalid existing image selection",
          });
        }
      }

      const newFiles = req.files || [];

      if (existingImages.length + newFiles.length > MAX_ITEM_IMAGES) {
        return res.status(400).json({
          success: false,
          message: `An item can have a maximum of ${MAX_ITEM_IMAGES} images`,
        });
      }

      const uploadedImages = await Promise.all(
        newFiles.map((file) => uploadToCloudinary(file.buffer)),
      );

      item.images = [
        ...existingImages,
        ...uploadedImages.map((image) => image.secure_url),
      ];
    }

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

    await Promise.all([
      item.deleteOne(),
      Request.deleteMany({ item: item._id }),
      Notification.deleteMany({ item: item._id }),
      Report.deleteMany({ item: item._id }),
    ]);

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
