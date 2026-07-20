const mongoose = require("mongoose");
const categories = require("../constants/categories");

const MAX_DESCRIPTION_WORDS = 150;
const countWords = (value = "") =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [70, "Item title cannot exceed 70 characters"],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1,000 characters"],
      validate: {
        validator: (value) => countWords(value) <= MAX_DESCRIPTION_WORDS,
        message: `Description cannot exceed ${MAX_DESCRIPTION_WORDS} words`,
      },
    },

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      enum: categories,
      required: true,
    },

    condition: {
      type: String,
      enum: ["new", "excellent", "good", "fair", "poor"],
      default: "good",
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: [80, "Pickup location cannot exceed 80 characters"],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      select: false,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
    contentLockedAt: {
      type: Date,
      default: null,
    },
    givenAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["available", "reserved", "given"],
      default: "available",
    },

    moderationStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.Item || mongoose.model("Item", itemSchema);
