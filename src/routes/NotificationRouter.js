const express = require("express");
const router = express.Router();
const NotifController = require("../controllers/notificationsController");

const { authUserMidleware } = require("../middleware/AuthMidleware");

// ===== BOX CATEGORIES =====

// get all 
router.get("/getNotifications", NotifController.getAllNotifications);

// update is_read : true
router.put("/read_notification", NotifController.readNotification);

// delete is_delete : true
router.put("/delete_notification", NotifController.deleteNotification);

// router.post("/box-categories", authUserMidleware, controller.createBoxCategory);
// router.put("/box-categories/:id", authUserMidleware, controller.updateBoxCategory);
// router.delete("/box-categories/:id", authUserMidleware, controller.deleteBoxCategory);


module.exports = router;
