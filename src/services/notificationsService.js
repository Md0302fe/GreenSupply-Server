const { truncate } = require("lodash");
const Notification = require("../models/Notifications");

// Get All Notificatons
const getAllNotifications = async (data) => {
  try {
    const allNoti = await Notification.find({ is_delete: false }).sort({
      createdAt: -1,
    });
    console.log(allNoti);
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
