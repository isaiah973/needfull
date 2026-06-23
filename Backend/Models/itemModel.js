const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
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
    requestCount: {
      type: Number,
      default: 0,
    },
    givenAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["available", "reserved", "given"],
      default: "available",
    },

    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.Item || mongoose.model("Item", itemSchema);
