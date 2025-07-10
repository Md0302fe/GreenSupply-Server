const express = require("express");
const router = express.Router();
const controller = require("../controllers/packageMaterialController");

const { authUserMidleware } = require("../middleware/AuthMidleware");

// ===== BOX CATEGORIES =====
router.post("/box-categories", authUserMidleware, controller.createBoxCategory);
router.put("/box-categories/:id", authUserMidleware, controller.updateBoxCategory);
router.delete("/box-categories/:id", authUserMidleware, controller.deleteBoxCategory);
router.get("/box-categories", controller.getBoxCategories);

// ===== BOXES =====
router.post("/boxes", authUserMidleware, controller.createBox);
router.put("/boxes/:id", authUserMidleware, controller.updateBox);
router.delete("/boxes/:id", authUserMidleware, controller.deleteBox);
router.get("/boxes", controller.getBoxes);

// ===== KHO =====
// router.post("/boxes/:id/import", authUserMidleware, controller.importBox);
// router.post("/boxes/:id/export", authUserMidleware, controller.exportBox);

module.exports = router;
