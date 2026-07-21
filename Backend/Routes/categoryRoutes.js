const express = require("express");
const { getCategories } = require("../Controllers/categoryController");

const router = express.Router();

router.get("/", getCategories);

module.exports = router;
