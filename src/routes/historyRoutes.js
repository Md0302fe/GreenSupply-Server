const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");

// Lấy danh sách các loại lịch sử
router.get("/", (req, res) => {
  res.json({
    message: "Lịch sử yêu cầu và cung cấp nhiên liệu",
    routes: [
      {
        path: "/history/fuel-requests",
        description: "Lịch sử yêu cầu nhiên liệu",
      },
      {
        path: "/history/fuel-supply-orders",
        description: "Lịch sử đơn cung cấp nhiên liệu",
      },
    ],
  });
});

// API cho lịch sử yêu cầu nhiên liệu
router.get("/fuel-requests", historyController.getFuelRequests);

// API cho lịch sử đơn cung cấp nhiên liệu
router.get("/fuel-supply-orders", historyController.getFuelSupplyOrders);

module.exports = router;
