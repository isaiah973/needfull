const mongoose = require("mongoose");
const nigerianStates = require("../constants/nigerianStates");
const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    street: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "Nigeria",
    },
    activeRequestCount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    state: {
      type: String,
      enum: ["", ...nigerianStates],
      default: "",
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email address is too long"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspensionReason: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      default: "",
    },

    verificationCodeExpires: {
      type: Date,
      default: null,
    },

    verificationCodeLastSentAt: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: "",
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },

    subscriptionExpiresAt: {
      type: Date,
    },

    savedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
