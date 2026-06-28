const adminOnly = (req, res, next) => {
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "superadmin")
  ) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};
//superAdminOnly middleware
const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Super Admin access required",
    });
  }

  next();
};

module.exports = {
  adminOnly,
  superAdminOnly,
};
