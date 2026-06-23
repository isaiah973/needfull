const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Protect middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token invalid",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  next();
};

// OPTIONAL AUTH
const protectOptional = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.user = null; // no user, but continue
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    req.user = user || null;

    next();
  } catch (error) {
    // if token invalid, just ignore and continue
    req.user = null;
    next();
  }
};

module.exports = { protect, adminOnly, protectOptional };
