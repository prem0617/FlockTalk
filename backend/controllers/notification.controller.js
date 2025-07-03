import NotificationModel from "../models/notification.model.js";
import { getReciverSocketId, io } from "../lib/socket.io.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notification = await NotificationModel.find({ to: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "from",
        select: "username profileImg",
      });

    await NotificationModel.updateMany(
      { to: userId },
      {
        $set: { read: true },
      }
    );

    const receiverSocketId = getReciverSocketId(userId);

    io.to(receiverSocketId).emit("allNotificationRead", 0);

    return res.status(200).json(notification);
  } catch (error) {
    console.log("Error in getNotifications", error.message);
    return res
      .status(500)
      .json({ error: "Error in get notifications, Internal server error" });
  }
};

export const getUnreadedNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await NotificationModel.find({
      to: userId,
      read: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications", error.message);
    return res
      .status(500)
      .json({ error: "Error in get notifications, Internal server error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // ? Delete all the notifications
    await NotificationModel.deleteMany({ to: userId });
    return res
      .status(200)
      .json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications", error.message);
    return res
      .status(500)
      .json({ error: "Error in deleteNotifications, Internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const deletedNotification = await NotificationModel.findByIdAndDelete(id);
    console.log(deletedNotification);
    if (!deletedNotification)
      return res.status(404).json({ error: "Notification not found" });
    console.log(";before dsocket");
    const receiverSocketId = getReciverSocketId(
      deletedNotification.to.toString()
    );
    console.log(receiverSocketId);
    io.to(receiverSocketId).emit("deleteNotification", deletedNotification);

    res.status(200).json(deleteNotification);
  } catch (error) {
    console.log(error);
  }
};
