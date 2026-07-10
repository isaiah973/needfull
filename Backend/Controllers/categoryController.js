const categories = require("../constants/categories");

const getCategories = (req, res) => {
  res.status(200).json({
    success: true,
    categories,
  });
};

module.exports = {
  getCategories,
};
