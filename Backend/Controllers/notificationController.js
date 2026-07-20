const Notification = require("../Models/notificationModel");

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate({
        path: "sender",
        match: { isDeleted: false },
        select: "name",
      })
      .populate({
        path: "item",
        match: { isActive: true },
        select: "title",
      })
      .populate("request", "status")
      .sort({ createdAt: -1 });

    const visibleNotifications = notifications.filter(
      (notification) =>
        notification.sender && notification.item && notification.request,
    );
    const visibleIds = new Set(
      visibleNotifications.map((notification) => notification._id.toString()),
    );
    const staleIds = notifications
      .filter((notification) => !visibleIds.has(notification._id.toString()))
      .map((notification) => notification._id);

    if (staleIds.length > 0) {
      await Notification.deleteMany({ _id: { $in: staleIds } });
    }

    res.status(200).json({
      success: true,
      notifications: visibleNotifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark one notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Only the owner of the notification can mark it as read
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
