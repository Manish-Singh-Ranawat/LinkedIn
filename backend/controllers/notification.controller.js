import Notification from "../models/notification.model.js";

// -- GET NOTIFICATIONS --
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "content image");
    res.status(200).json( notifications );
  } catch (error) {
    console.log("error in get notifications controller : ", error);
    res.status(500).json({ message: "Failed to get notifications" });
  }
};

// -- MARK NOTIFICATION AS READ --
export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ notification });
  } catch (error) {
    console.log("error in mark notification as read controller : ", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// -- DELETE NOTIFICATION --
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findByIdAndDelete({
      _id: notificationId,
      recipient: req.user._id,
    });
    res.status(200).json({ notification });
  } catch (error) {
    console.log("error in delete notification controller : ", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};
