const express = require("express");
const router = express.Router();
const ProvideOrderController = require("../controllers/ProvideOrderController");


// API cho lịch sử đơn cung cấp nhiên liệu
router.get("/fuel-provide-orders", ProvideOrderController.getAllProvideOrders);

module.exports = router;
