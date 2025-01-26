const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");

exports.getFuelRequests = async (req, res) => {
  try {
    const requests = await FuelRequest.find({ is_deleted: false });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu Fuel Requests" });
  }
};

exports.getFuelSupplyOrders = async (req, res) => {
  try {
    const orders = await FuelSupplyOrder.find({ is_deleted: false });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu Fuel Supply Orders" });
  }
};
