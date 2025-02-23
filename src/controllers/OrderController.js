const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");

const OrderServices = require("../services/OrderService");

/// GetAll order by status đã duyệt
const getAllorderbySucess = async (req, res) => {
  try {
    const response = await OrderServices.getAllorderbySucess();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      eMsg: error.message || "Lỗi không lấy được danh sách yêu cầu đã duyệt",
    });
  }
};

// Lấy tất cả yêu cầu nhiên liệu với các bộ lọc
const getFuelRequests = async (req, res) => {
  try {
    const requests = await FuelRequest.find().populate("supplier_id"); // Populate để lấy thông tin nhà cung cấp
    if (!requests) {
      res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
    }
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
  }
};

// Lấy tất cả đơn cung cấp nhiên liệu với các bộ lọc
const getFuelSupplyOrders = async (req, res) => {
  try {
    const orders = await FuelSupplyOrder.find().populate("supplier_id");
    if (!orders) {
      res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Supply Orders" });
    }
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Supply Orders" });
  }
};

const getAllProvideOrders = async (req, res) => {
  try {
    const filters = req.query;
    const response = await OrderServices.getAllProvideOrders(filters);
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

// Lấy yêu cầu nhiên liệu theo ID
const getFuelRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FuelRequest.findById(id).populate("supplier_id");
    if (!request) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy yêu cầu nhiên liệu" });
  }
};

// Chấp nhận yêu cầu nhiên liệu
const acceptFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FuelRequest.findByIdAndUpdate(id, { status: "Đã duyệt" }, { new: true });
    if (!request) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi chấp nhận yêu cầu nhiên liệu" });
  }
};

// Từ chối yêu cầu nhiên liệu
const rejectFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FuelRequest.findByIdAndUpdate(id, { status: "Đã Hủy" }, { new: true });
    if (!request) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi từ chối yêu cầu nhiên liệu" });
  }
};

// Hoàn thành yêu cầu nhiên liệu
const completeFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FuelRequest.findByIdAndUpdate(id, { status: "Hoàn thành" }, { new: true });
    if (!request) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi hoàn thành yêu cầu nhiên liệu" });
  }
};


// Lấy đơn cung cấp nhiên liệu theo ID
const getFuelSupplyOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findById(id).populate("supplier_id");
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy đơn cung cấp nhiên liệu" });
  }
};

// Chấp nhận đơn cung cấp nhiên liệu
const acceptFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findByIdAndUpdate(id, { status: "Đã duyệt" }, { new: true });
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi chấp nhận đơn cung cấp nhiên liệu" });
  }
};

// Từ chối đơn cung cấp nhiên liệu
const rejectFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findByIdAndUpdate(id, { status: "Đã hủy" }, { new: true });
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi từ chối đơn cung cấp nhiên liệu" });
  }
};

// Hoàn thành đơn cung cấp nhiên liệu
const completeFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findByIdAndUpdate(id, { status: "Hoàn thành" }, { new: true });
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi hoàn thành đơn cung cấp nhiên liệu" });
  }
};

module.exports = {
  getAllorderbySucess,
  getFuelRequests,
  getAllProvideOrders,
  getFuelSupplyOrders,
  getFuelRequestById,
  acceptFuelRequest,
  rejectFuelRequest,
  completeFuelRequest,
  getFuelSupplyOrderById,
  acceptFuelSupplyOrder,
  rejectFuelSupplyOrder,
  completeFuelSupplyOrder,
};
