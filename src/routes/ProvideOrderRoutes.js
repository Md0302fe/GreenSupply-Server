const express = require("express");
const router = express.Router();
const ProvideOrderController = require("../controllers/ProvideOrderController");

const {
    authAdminMidleware,
    authUserMidleware,
  } = require("../middleware/AuthMidleware");

// API cho lịch sử đơn cung cấp nhiên liệu
router.get("/fuel-provide-orders", ProvideOrderController.getAllProvideOrders);

// 
router.get("/provide-order-histories", authUserMidleware, ProvideOrderController.getProvideOrderHistories);

module.exports = router;
