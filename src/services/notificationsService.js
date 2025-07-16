const mongoose = require("mongoose");
const Notification = require("../models/Notifications");

const admin_role = "67950da386a0a462d408c7b9";
const object_admin_role = new mongoose.Types.ObjectId(
  "67950da386a0a462d408c7b9"
);

// Get All Notifications By Role (Admin - Manager)
const getAllNotifications = async (role_id) => {
  try {
    const allNoti = await Notification.find({
      role_id: role_id,
      is_delete: false,
    }).sort({
      createdAt: -1,
    });

    return allNoti;
  } catch (err) {
    console.error("Error updating notification:", err);
    throw err;
  }
};

// Get All Notificatons By Id
const getAllNotificationsById = async (user_id) => {
  try {
    const allNoti = await Notification.find({
      user_id: user_id,
      is_delete: false,
      is_sended: true,
    }).sort({
      createdAt: -1,
    });
    return allNoti;
  } catch (err) {
    console.error("Error updating notification:", err);
    throw err;
  }
};

// Read Notification
const readNotification = async (notification_id) => {
  try {
    const response = await Notification.findByIdAndUpdate(
      notification_id,
      { is_read: true },
      { new: true } // optional: trả về bản ghi sau khi update
    );
    return response;
  } catch (err) {
    console.error("Error updating notification:", err);
    throw err;
  }
};

// Delete Notification
const deleteNotification = async (notification_id) => {
  try {
    const response = await Notification.findByIdAndUpdate(
      notification_id,
      { is_delete: true },
      { new: true } // optional: trả về bản ghi sau khi update
    );
    return response;
  } catch (err) {
    console.error("Error delete notification:", err);
    throw err;
  }
};

module.exports = {
  getAllNotifications,
  readNotification,
  deleteNotification,
  getAllNotificationsById,
};
