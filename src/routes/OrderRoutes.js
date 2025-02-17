const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");

// API cho lịch sử yêu cầu nhiên liệu
router.get("/fuel-requests", OrderController.getFuelRequests);
router.get("/fuel-requests/:id", OrderController.getFuelRequestById); // Endpoint cho yêu cầu nhiên liệu theo ID
router.post("/fuel-requests/:id/accept", OrderController.acceptFuelRequest); // Endpoint chấp nhận yêu cầu
router.post("/fuel-requests/:id/reject", OrderController.rejectFuelRequest); // Endpoint từ chối yêu cầu

// API cho lịch sử đơn cung cấp nhiên liệu
router.get("/fuel-supply-orders", OrderController.getFuelSupplyOrders);
router.get("/fuel-supply-orders/:id", OrderController.getFuelSupplyOrderById); // Endpoint cho đơn cung cấp nhiên liệu theo ID
router.post("/fuel-supply-orders/:id/accept", OrderController.acceptFuelSupplyOrder); // Endpoint chấp nhận đơn hàng
router.post("/fuel-supply-orders/:id/reject", OrderController.rejectFuelSupplyOrder); // Endpoint từ chối đơn hàng



///API  cho hiện thị trạng thái thành công của đơn thu hàng dành cho admin

router.get("/fuel-request/GetALLstatusSuccess", OrderController.getAllApprovedRequests); // Endpoint cho lịch sử yêu cầu nhiên liệu theo ID", OrderController.rejectFuelSupplyOrder);
router.get("/approved-fuel-requests", OrderController.getAllApprovedFuelRequests);
router.get("/approved-fuel-supply-orders", OrderController.getAllApprovedFuelSupplyOrders);


module.exports = router;