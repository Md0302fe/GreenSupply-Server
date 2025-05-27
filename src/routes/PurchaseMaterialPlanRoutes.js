const express = require("express");
const router = express.Router();
const FuelEntryController = require("../controllers/PurchaseMaterialPlanController");

// API cho lịch sử yêu cầu nhiên liệu
router.get("/fuel-list", FuelEntryController.getAll);
router.get("/fuel-detail/:id", FuelEntryController.getFuelEntryDetail);


module.exports = router;