// const adminOnly = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized",
//     });
//   }

//   if (req.user.role !== "admin") {
//     return res.status(403).json({
//       success: false,
//       message: "Admin access required",
//     });
//   }

//   next();
// };
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  next();
};
module.exports = adminOnly;
