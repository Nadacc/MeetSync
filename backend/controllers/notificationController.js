import Notification from "../models/NotificationModel.js";

export const getNotifications = async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  res.json(notifications);
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

export const createNotification = async (req, res) => {
  const { userId, title, message } = req.body;

  const notification = await Notification.create({
    user: userId,
    title,
    message,
  });

  res.status(201).json(notification);
};
