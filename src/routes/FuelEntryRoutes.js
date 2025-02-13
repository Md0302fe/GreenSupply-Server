const express = require("express");
const router = express.Router();
const FuelEntryController = require("../controllers/FuelEntryController");

// API cho lịch sử yêu cầu nhiên liệu
router.get("/fuel-list", FuelEntryController.getAll);


module.exports = router;