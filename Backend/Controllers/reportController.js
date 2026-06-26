const mongoose = require("mongoose");
const Report = require("../Models/reportModel");
const Item = require("../Models/itemModel");

// USER: Report an item
const createReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report your own item",
      });
    }

    const existingReport = await Report.findOne({
      reporter: req.user._id,
      item: id,
      status: "pending",
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this item",
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      item: id,
      reason,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("createReport:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to submit report",
    });
  }
};

// ADMIN: Get all reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email")
      .populate("item", "title images status")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("getAllReports:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

// ADMIN: Get single report
const getSingleReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await Report.findById(id)
      .populate("reporter", "name email")
      .populate("item")
      .populate("reviewedBy", "name");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("getSingleReport:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
    });
  }
};

// ADMIN: Resolve report
const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    report.status = "resolved";
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();

    await report.save();

    res.status(200).json({
      success: true,
      message: "Report resolved successfully",
      report,
    });
  } catch (error) {
    console.error("resolveReport:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to resolve report",
    });
  }
};

// ADMIN: Dismiss report
const dismissReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    report.status = "dismissed";
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();

    await report.save();

    res.status(200).json({
      success: true,
      message: "Report dismissed successfully",
      report,
    });
  } catch (error) {
    console.error("dismissReport:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to dismiss report",
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getSingleReport,
  resolveReport,
  dismissReport,
};
