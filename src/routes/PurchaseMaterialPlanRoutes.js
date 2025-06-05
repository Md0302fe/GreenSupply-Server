const express = require("express");
const router = express.Router();
const FuelEntryController = require("../controllers/PurchaseMaterialPlanController");

const {
    authMidleware,
    authUserMidleware,
  } = require("../middleware/AuthMidleware");

// API cho lịch sử yêu cầu nhiên liệu
router.get("/fuel-list", authUserMidleware, FuelEntryController.getAll);
router.get("/fuel-detail/:id", FuelEntryController.getFuelEntryDetail);


module.exports = router;