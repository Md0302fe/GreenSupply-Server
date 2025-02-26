const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");

// API cho lịch sử yêu cầu nhiên liệu
router.get("/fuel-requests", OrderController.getFuelRequests);
router.get("/fuel-requests/:id", OrderController.getFuelRequestById); // Lấy yêu cầu nhiên liệu theo ID
router.post("/fuel-requests/:id/accept", OrderController.acceptFuelRequest); // Chấp nhận yêu cầu
router.post("/fuel-requests/:id/reject", OrderController.rejectFuelRequest); // Từ chối yêu cầu
router.post("/fuel-requests/:id/complete", OrderController.completeFuelRequest); // Hoàn thành yêu cầu nhiên liệu

// API cho lịch sử đơn cung cấp nhiên liệu
router.get("/fuel-supply-orders", OrderController.getFuelSupplyOrders);
router.get("/fuel-supply-orders/:id", OrderController.getFuelSupplyOrderById); // Lấy đơn cung cấp nhiên liệu theo ID
router.post("/fuel-supply-orders/:id/accept", OrderController.acceptFuelSupplyOrder); // Chấp nhận đơn hàng
router.post("/fuel-supply-orders/:id/reject", OrderController.rejectFuelSupplyOrder); // Từ chối đơn hàng
router.post("/fuel-supply-orders/:id/complete", OrderController.completeFuelSupplyOrder); // Hoàn thành đơn cung cấp nhiên liệu

// API hiển thị trạng thái thành công của đơn hàng dành cho admin
// router.get("/fuel-request/GetALLstatusSuccess", OrderController.getAllorderbySucess);


// API  cho hiện thị trạng thái thành công của đơn thu hàng dành cho admin

router.get("/fuel-request/GetALLstatusSuccess", OrderController.getAllApprovedRequests); // Endpoint cho lịch sử yêu cầu nhiên liệu theo ID", OrderController.rejectFuelSupplyOrder);
router.get("/approved-fuel-requests", OrderController.getAllApprovedFuelRequests);
router.get("/approved-fuel-supply-orders", OrderController.getAllApprovedFuelSupplyOrders);


//  API cập nhật trạng thái đơn hàng
router.put("/orders/:id/update-status", OrderController.updateOrderStatus);


module.exports = router;
