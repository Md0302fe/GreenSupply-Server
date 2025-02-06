const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");

exports.getFuelRequests = async (req, res) => {
  try {
    const { fuel_name, status, supplier_id, min_price, max_price } = req.query;

    let filter = { is_deleted: false };

    if (fuel_name) filter.fuel_name = { $regex: fuel_name, $options: "i" };
    if (status) filter.status = status;
    if (supplier_id) filter.supplier_id = supplier_id;
    if (min_price) filter.price = { ...filter.price, $gte: parseFloat(min_price) };
    if (max_price) filter.price = { ...filter.price, $lte: parseFloat(max_price) };

    const requests = await FuelRequest.find(filter);
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
  }
};

exports.getFuelSupplyOrders = async (req, res) => {
  try {
    const { fuel_name, status, supplier_id, quality, min_price, max_price } = req.query;

    let filter = { is_deleted: false };

    if (fuel_name) filter.fuel_name = { $regex: fuel_name, $options: "i" };
    if (status) filter.status = status;
    if (supplier_id) filter.supplier_id = supplier_id;
    if (quality) filter.quality = { $regex: quality, $options: "i" };
    if (min_price) filter.price = { ...filter.price, $gte: parseFloat(min_price) };
    if (max_price) filter.price = { ...filter.price, $lte: parseFloat(max_price) };

    const orders = await FuelSupplyOrder.find(filter);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Supply Orders" });
  }
};
