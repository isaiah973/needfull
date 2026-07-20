const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";
    const token = req.cookies.token || bearerToken;

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
    if (user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "This account has been permanently deleted",
      });
    }
    // Prevent suspended users from accessing protected routes
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended.",
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

// const adminOnly = (req, res, next) => {
//   if (!req.user || req.user.role !== "admin") {
//     return res.status(403).json({
//       success: false,
//       message: "Admin only",
//     });
//   }

//   next();
// };

// OPTIONAL AUTH
const protectOptional = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";
    const token = req.cookies.token || bearerToken;

    if (!token) {
      req.user = null; // no user, but continue
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    req.user = user && !user.isDeleted ? user : null;

    next();
  } catch (error) {
    // if token invalid, just ignore and continue
    req.user = null;
    next();
  }
};

module.exports = { protect, protectOptional };
