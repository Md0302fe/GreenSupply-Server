const express = require("express");
const router = express.Router();
const ProductOrderAdminController = require("../controllers/ProductOrderAdminController");

const { authUserMidleware } = require("../middleware/AuthMidleware");


router.get("/getAllOrders", ProductOrderAdminController.getAllOrders);
router.get("/order-detail/:id", ProductOrderAdminController.getAllOrdersDetail);
router.put("/order-processing/:id", ProductOrderAdminController.updateOrderProcessing);
router.put("/order-shipping/:id", ProductOrderAdminController.updateOrderShipping);
router.put("/order-delivered/:id", ProductOrderAdminController.updateOrderDelivered);

module.exports = router; 
