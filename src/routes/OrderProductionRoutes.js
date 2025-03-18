const express = require("express");
const router = express.Router();
const OrderProductionController = require("../controllers/OrderProductionController");

const { authUserMidleware } = require("../middleware/AuthMidleware");

router.post("/createOrderProduction", OrderProductionController.createOrderProductions);
router.get("/getAllOrders", OrderProductionController.getAllOrders);


router.get("/order-detail/:id", OrderProductionController.getAllOrdersDetail);
router.put('/updateOrderProduction/:id', OrderProductionController.updateOrderOrderProduction);



module.exports = router; // ✅ Đảm bảo export đúng
