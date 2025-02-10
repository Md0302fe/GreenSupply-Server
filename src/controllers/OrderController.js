const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");

// Lấy tất cả yêu cầu nhiên liệu với các bộ lọc
exports.getFuelRequests = async (req, res) => {
  try {
  
    const requests = await FuelRequest.find().populate('supplier_id'); // Populate để lấy thông tin nhà cung cấp
    if(!requests) {
      res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
    }
   res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
  }
};

// Lấy tất cả đơn cung cấp nhiên liệu với các bộ lọc
exports.getFuelSupplyOrders = async (req, res) => {
  try {
    const orders = await FuelSupplyOrder.find().populate('supplier_id'); // Populate để lấy thông tin nhà cung cấp
    if(!orders) {
      res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
    }
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Supply Orders" });
  }
};


// Lấy yêu cầu nhiên liệu theo ID
exports.getFuelRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FuelRequest.findById(id).populate('supplier_id');
    if (!request) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy yêu cầu nhiên liệu" });
  }
};

// Chấp nhận yêu cầu nhiên liệu
exports.acceptFuelRequest = async (req, res) => { 
  try {
    const { id } = req.params;
    const request = await FuelRequest.findByIdAndUpdate(id, { status: 'Đã duyệt' }, { new: true });
    if (!request) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi chấp nhận yêu cầu nhiên liệu" });
  }
};

// Từ chối yêu cầu nhiên liệu
exports.rejectFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FuelRequest.findByIdAndUpdate(id, { status: 'Đã Hủy' }, { new: true });
    if (!request) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi từ chối yêu cầu nhiên liệu" });
  }
};


// Lấy đơn cung cấp nhiên liệu theo ID
exports.getFuelSupplyOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findById(id).populate('supplier_id');
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy đơn cung cấp nhiên liệu" });
  }
};

// Chấp nhận đơn cung cấp nhiên liệu
exports.acceptFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findByIdAndUpdate(id, { status: 'Đã duyệt' }, { new: true });
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi chấp nhận đơn cung cấp nhiên liệu" });
  }
};

// Từ chối đơn cung cấp nhiên liệu
exports.rejectFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findByIdAndUpdate(id, { status: 'Đã hủy' }, { new: true });
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi từ chối đơn cung cấp nhiên liệu" });
  }
};