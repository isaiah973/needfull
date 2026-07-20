const mongoose = require("mongoose");
const Request = require("../Models/requestModel");
const Item = require("../Models/itemModel");
const Notification = require("../Models/notificationModel");

const createRequest = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId || req.params.id);
    const message = req.body.message?.trim();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "A message to the owner is required",
      });
    }

    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own item",
      });
    }

    // Automatically expire subscription if it has ended
    if (
      req.user.isSubscribed &&
      req.user.subscriptionExpiresAt &&
      req.user.subscriptionExpiresAt < new Date()
    ) {
      req.user.isSubscribed = false;
      req.user.subscriptionExpiresAt = null;
      await req.user.save();
    }

    // Free users can only have 5 active requests
    if (!req.user.isSubscribed) {
      const activeRequests = await Request.countDocuments({
        requester: req.user._id,
        status: {
          $in: ["pending", "approved"],
        },
      });

      if (activeRequests >= 5) {
        return res.status(403).json({
          success: false,
          message:
            "You have reached your limit of 5 active requests. Subscribe to Needful Plus for unlimited requests.",
        });
      }
    }

    const existingRequest = await Request.findOne({
      item: item._id,
      requester: req.user._id,
    });

    if (item.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Item is no longer available",
      });
    }

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already requested this item",
      });
    }

    const request = await Request.create({
      item: item._id,
      requester: req.user._id,
      message,
    });

    item.requestCount += 1;
    item.contentLockedAt = item.contentLockedAt || new Date();
    await item.save();

    await Notification.create({
      recipient: item.owner,
      sender: req.user._id,
      type: "new_request",
      item: item._id,
      request: request._id,
      message: `${req.user.name} requested your "${item.title}".`,
    });

    res.status(201).json({
      success: true,
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRequestStatus = async (req, res) => {
  try {
    const request = await Request.findOne({
      item: req.params.id,
      requester: req.user._id,
    }).select("status");

    res.status(200).json({
      success: true,
      hasRequested: Boolean(request),
      status: request?.status || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      requester: req.user._id,
    })
      .populate({
        path: "item",
        populate: {
          path: "owner",
          select: "name avatar",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10) || 1;
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 20;
    const page = Math.max(1, requestedPage);
    const limit = Math.min(50, Math.max(1, requestedLimit));
    const allowedStatuses = ["pending", "approved", "rejected", "completed"];
    const status = allowedStatuses.includes(req.query.status)
      ? req.query.status
      : "";

    const myItems = await Item.find({
      owner: req.user._id,
    }).select("_id");

    const itemIds = myItems.map((item) => item._id);
    const filter = {
      item: { $in: itemIds },
      ...(status && { status }),
    };

    if (mongoose.Types.ObjectId.isValid(req.query.requestId)) {
      filter._id = req.query.requestId;
    }

    const [requests, total, statusCounts] = await Promise.all([
      Request.find(filter)
        .populate("item", "title images location status")
        .populate({
          path: "requester",
          match: { isDeleted: false },
          select: "name email phone avatar",
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Request.countDocuments(filter),
      Request.aggregate([
        { $match: { item: { $in: itemIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const visibleRequests = requests.filter((request) => request.requester);
    const counts = statusCounts.reduce(
      (result, entry) => ({ ...result, [entry._id]: entry.count }),
      { pending: 0, approved: 0, rejected: 0, completed: 0 },
    );
    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.status(200).json({
      success: true,
      requests: visibleRequests,
      counts,
      pagination: {
        page: Math.min(page, totalPages),
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "item",
      "owner status",
    );

    if (!request || !request.item) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Request.findByIdAndUpdate(request._id, {
      status: "approved",
    });

    await Request.updateMany(
      {
        item: request.item._id,
        _id: { $ne: request._id },
      },
      {
        status: "rejected",
      },
    );

    await Item.findByIdAndUpdate(request.item._id, {
      status: "reserved",
    });

    res.status(200).json({
      success: true,
      message: "Request approved",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "item",
      "owner",
    );

    if (!request || !request.item) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Request.findByIdAndUpdate(request._id, {
      status: "rejected",
    });

    res.status(200).json({
      success: true,
      message: "Request rejected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "item",
      "owner",
    );

    if (!request || !request.item) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Request.findByIdAndUpdate(request._id, {
      status: "completed",
    });

    await Item.findByIdAndUpdate(request.item._id, {
      status: "given",
      givenAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Item marked as given",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getRequestStatus,
  getMyRequests,
  getReceivedRequests,
  approveRequest,
  rejectRequest,
  completeRequest,
};
