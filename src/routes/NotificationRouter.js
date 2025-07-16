const express = require("express");
const router = express.Router();
const NotifController = require("../controllers/notificationsController");

const { authUserMidleware } = require("../middleware/AuthMidleware");

// ===== BOX CATEGORIES =====

// get all by admin
router.get("/getNotifications",authUserMidleware, NotifController.getAllNotifications);

// get all byid
router.get(
  "/getNotificationsById",
  authUserMidleware,
  NotifController.getAllNotificationsById
);

// update is_read : true
router.put(
  "/read_notification",
  authUserMidleware,
  NotifController.readNotification
);

// delete is_delete : true
router.put(
  "/delete_notification",
  authUserMidleware,
  NotifController.deleteNotification
);

// router.post("/box-categories", authUserMidleware, controller.createBoxCategory);
// router.put("/box-categories/:id", authUserMidleware, controller.updateBoxCategory);
// router.delete("/box-categories/:id", authUserMidleware, controller.deleteBoxCategory);

module.exports = router;
