const express = require("express");
const router = express.Router();
const ProductOrderAdminController = require("../controllers/ProductOrderAdminController");

const { authUserMidleware } = require("../middleware/AuthMidleware");


router.get("/getAllOrders", ProductOrderAdminController.getAllOrders);
router.get("/order-detail/:id", ProductOrderAdminController.getAllOrdersDetail);

module.exports = router; 
