const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController"); // KIỂM TRA KỸ DÒNG NÀY

router.get("/fuel-requests", historyController.getFuelRequests);
router.get("/fuel-supply-orders", historyController.getFuelSupplyOrders);

module.exports = router;
