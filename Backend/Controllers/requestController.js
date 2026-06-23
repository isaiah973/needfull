const Request = require("../Models/requestModel");
const Item = require("../Models/itemModel");

const createRequest = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own item",
      });
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
      owner: item.owner,
      requester: req.user._id,
      message: req.body.message,
    });

    item.requestCount += 1;
    await item.save();

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

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      requester: req.user._id,
    })
      .populate("item")
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
    const requests = await Request.find({
      owner: req.user._id,
    })
      .populate("item")
      .populate("requester", "name email")
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

const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    request.status = "approved";
    await request.save();

    await Request.updateMany(
      {
        item: request.item,
        _id: { $ne: request._id },
      },
      {
        status: "rejected",
      },
    );

    await Item.findByIdAndUpdate(request.item, {
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
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    request.status = "rejected";

    await request.save();

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
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    request.status = "completed";

    await request.save();

    await Item.findByIdAndUpdate(request.item, {
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
  getMyRequests,
  getReceivedRequests,
  approveRequest,
  rejectRequest,
  completeRequest,
};
