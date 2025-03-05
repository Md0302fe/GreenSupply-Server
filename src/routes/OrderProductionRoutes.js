const express = require("express");
const router = express.Router();
const OrderProductionController = require("../controllers/OrderProductionController");

router.post("/createOrderProduction", OrderProductionController.createOrderProductions);
router.get("/getAllOrders", OrderProductionController.getAllOrders);


module.exports = router; // ✅ Đảm bảo export đúng
