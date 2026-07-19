const User = require("../Models/userModel");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const generateVerificationCode = require("../utils/generateVerificationCode");
const generateTokenAndSetCookie = require("../utils/generateTokenAndSetCookie");
const Item = require("../Models/itemModel");
const Request = require("../Models/requestModel");
const Notification = require("../Models/notificationModel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendPasswordChangedEmail,
  sendEmailChangedNotifications,
} = require("../utils/sendEmail");

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

// REGISTER

const registerUser = async (req, res) => {
  try {
    const { name, password, phone, state } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!name || !email || !password || !state) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and state are required",
      });
    }

    // Strong password validation
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser && !existingUser.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Older deleted accounts may still hold their original email. Release it
    // without restoring any of the old account's data or relationships.
    if (existingUser?.isDeleted) {
      existingUser.email = `deleted-${existingUser._id}-${Date.now()}@deleted.needful.invalid`;
      await existingUser.save();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      state,
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });

    await sendVerificationEmail(user.email, verificationCode, user.name);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Verification code sent.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        state: user.state,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const saveItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const user = await User.findById(req.user._id);

    const alreadySaved = user.savedItems.includes(itemId);

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: "Item already saved",
      });
    }

    user.savedItems.push(itemId);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Item saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeSavedItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const user = await User.findById(req.user._id);

    user.savedItems = user.savedItems.filter(
      (savedId) => savedId.toString() !== itemId,
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Item removed from saved items",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    user.isVerified = true;
    user.verificationCode = "";
    user.verificationCodeExpires = null;

    await user.save();

    const token = generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        state: user.state,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

const getPublicProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).select("name avatar state createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const items = await Item.find({
      owner: user._id,
      moderationStatus: "approved",
      isActive: true,
    })
      .populate("owner", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const name = req.body.name?.trim();
    const phone = req.body.phone?.trim();
    const state = req.body.state?.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "State is required",
      });
    }

    user.name = name;
    user.phone = phone ?? user.phone;
    user.state = state;

    if (req.file) {
      const uploadedAvatar = await uploadToCloudinary(req.file.buffer);
      user.avatar = uploadedAvatar.secure_url;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        state: user.state,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSavedItems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedItems");

    res.status(200).json({
      success: true,
      savedItems: user.savedItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "This account has been deleted.",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const token = generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        state: user.state,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGOUT
const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// RESEND VERIFICATION CODE
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    const verificationCode = generateVerificationCode();

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendVerificationEmail(user.email, verificationCode, user.name);

    res.status(200).json({
      success: true,
      message: "Verification code resent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isDeleted) {
      return res.status(410).json({
        success: false,
        message: "This account has been permanently deleted",
      });
    }

    const resetToken = generateVerificationCode();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendResetPasswordEmail(user.email, resetToken, user.name);

    res.status(200).json({
      success: true,
      message: "Reset code sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, token and new password are required",
      });
    }

    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isDeleted) {
      return res.status(410).json({
        success: false,
        message: "This account has been permanently deleted",
      });
    }

    if (user.resetPasswordToken !== token) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Reset token has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changeEmail = async (req, res) => {
  try {
    const newEmail = req.body.newEmail?.trim().toLowerCase();
    const currentPassword = req.body.currentPassword;

    if (!newEmail || !currentPassword) {
      return res.status(400).json({
        success: false,
        message: "New email and current password are required",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    const user = await User.findById(req.user._id);
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (newEmail === user.email) {
      return res.status(400).json({
        success: false,
        message: "This is already your email address",
      });
    }

    const emailInUse = await User.exists({
      email: newEmail,
      _id: { $ne: user._id },
    });

    if (emailInUse) {
      return res.status(409).json({
        success: false,
        message: "An account already uses this email address",
      });
    }

    const oldEmail = user.email;
    user.email = newEmail;
    await user.save();

    try {
      await sendEmailChangedNotifications(
        oldEmail,
        user.email,
        user.name,
      );
    } catch (emailError) {
      console.error(
        "Email-change notification failed:",
        emailError.message,
      );
    }

    res.status(200).json({
      success: true,
      message: "Email address updated successfully",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
    }

    const user = await User.findById(req.user._id);
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error(
        "Password-change notification failed:",
        emailError.message,
      );
    }

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required",
      });
    }

    const user = await User.findById(userId);
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const [outgoingRequestCounts, ownedItems] = await Promise.all([
      Request.aggregate([
        { $match: { requester: userId } },
        {
          $group: {
            _id: "$item",
            count: { $sum: 1 },
          },
        },
      ]),
      Item.find({ owner: userId }).select("_id"),
    ]);

    const ownedItemIds = ownedItems.map((item) => item._id);

    await Promise.all([
      User.findByIdAndUpdate(userId, {
        isDeleted: true,
        deletedAt: new Date(),
        email: `deleted-${userId}-${Date.now()}@deleted.needful.invalid`,
        resetPasswordToken: "",
        resetPasswordExpires: null,
        verificationCode: "",
        verificationCodeExpires: null,
        savedItems: [],
      }),
      Item.updateMany({ owner: userId }, { isActive: false }),
      Request.deleteMany({
        $or: [
          { requester: userId },
          { item: { $in: ownedItemIds } },
        ],
      }),
      Notification.deleteMany({
        $or: [{ sender: userId }, { recipient: userId }],
      }),
      ...outgoingRequestCounts.map(({ _id: itemId, count }) =>
        Item.updateOne({ _id: itemId }, [
          {
            $set: {
              requestCount: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ["$requestCount", 0] },
                      count,
                    ],
                  },
                ],
              },
            },
          },
        ]),
      ),
    ]);

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  getProfile,
  getPublicProfile,
  updateProfile,
  changeEmail,
  changePassword,
  getSavedItems,
  saveItem,
  removeSavedItem,
  deleteAccount,
};
