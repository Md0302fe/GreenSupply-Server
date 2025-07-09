const Notifications = require("../services/notificationsService");

// Box Category Controllers
const getAllNotifications = async (req, res) => {
  try {
    const data = await Notifications.getAllNotifications(req.body);
    if (!data) {
      res
        .status(500)
        .json({
          success: false,
          message: "Không thể truy cập - lấy dữ liệu thông báo",
        });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// read notifications
const readNotification = async (req, res) => {
  try {
    const { notification_id } = req.body;
    const data = await Notifications.readNotification(notification_id);
    if (!data) {
      res
        .status(500)
        .json({
          success: false,
          message: "Không thể cập nhật trạng thái thông báo",
        });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notification_id } = req.body;
    const data = await Notifications.deleteNotification(notification_id);
    if (!data) {
      res
        .status(500)
        .json({ success: false, message: "Không thể xóa thông báo" });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllNotifications,
  readNotification,
  deleteNotification,
};
