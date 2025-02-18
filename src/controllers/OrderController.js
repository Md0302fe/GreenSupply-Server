const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");
const AdminFuelEntry = require("../models/Admin_Fuel_Entry");

const OrderServices = require("../services/OrderService");



/// GetAll order by status đã duyệt
const getAllApprovedRequests = async (req, res) => {
  try {
    const response = await OrderServices.getAllApprovedRequests();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      eMsg: error.message || "Lỗi không lấy được danh sách yêu cầu đã duyệt",
    });
  }
};

/// API lấy danh sách đã duyệt từ bảng FuelRequest
const getAllApprovedFuelRequests = async (req, res) => {
  try {
    const response = await OrderServices.getAllApprovedFuelRequests();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      eMsg: error.message || "Lỗi không lấy được danh sách yêu cầu thu hàng đã duyệt",
    });
  }
};

/// API lấy danh sách đã duyệt từ bảng FuelSupplyOrder
const getAllApprovedFuelSupplyOrders = async (req, res) => {
  try {
    const response = await OrderServices.getAllApprovedFuelSupplyOrders();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      eMsg: error.message || "Lỗi không lấy được danh sách đơn cung cấp nhiên liệu đã duyệt",
    });
  }
};







// Lấy tất cả yêu cầu nhiên liệu với các bộ lọc
const getFuelRequests = async (req, res) => {
  try {

    const requests = await FuelRequest.find().populate('supplier_id'); // Populate để lấy thông tin nhà cung cấp
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
    const orders = await FuelSupplyOrder.find().populate('supplier_id'); // Populate để lấy thông tin nhà cung cấp
    if (!orders) {
      res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
    }
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Supply Orders" });
  }
};


// Lấy yêu cầu nhiên liệu theo ID
const getFuelRequestById = async (req, res) => {
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
const acceptFuelRequest = async (req, res) => {
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
const rejectFuelRequest = async (req, res) => {
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
const getFuelSupplyOrderById = async (req, res) => {
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
const acceptFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await FuelSupplyOrder.findByIdAndUpdate(
      id,
      { status: "Đã duyệt" },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    }

    const updateRemainQuantity = await AdminFuelEntry.findById(order.request_id);
    if (!updateRemainQuantity) {
      return res.status(404).json({ success: false, error: "Không tìm thấy AdminFuelEntry" });
    }

    const currentQuantityRemain = Number(updateRemainQuantity.quantity_remain) || 0;
    const newQuantityRemain = currentQuantityRemain - Number(order.quantity);

    const updatedEntry = await AdminFuelEntry.findByIdAndUpdate(
      order.request_id,
      { quantity_remain: newQuantityRemain }, // Thay vì dùng `$inc`, cập nhật giá trị mới
      { new: true }
    );
    if (updatedEntry.quantity_remain <= 0) {
      await AdminFuelEntry.findByIdAndUpdate(order.request_id, { status: "Đã Hoàn Thành" });

      await FuelSupplyOrder.updateMany(
        { request_id: order.request_id, status: "Chờ duyệt" },
        { status: "Vô hiệu hóa", note: "Đơn hàng của bạn bị vô hiệu hóa do yêu cầu đã đủ chỉ tiêu" }
      );
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Lỗi khi chấp nhận đơn cung cấp nhiên liệu:", error);
    res.status(500).json({ success: false, error: "Lỗi khi chấp nhận đơn cung cấp nhiên liệu" });
  }
};


// Từ chối đơn cung cấp nhiên liệu
const rejectFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findByIdAndUpdate(id, { status: 'Đã hủy' }, { new: true });
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi từ chối đơn cung cấp nhiên liệu" });
  }
};


module.exports = {
  getAllApprovedRequests,
  getFuelRequests,
  getFuelSupplyOrders,
  getFuelRequestById,
  acceptFuelRequest,
  rejectFuelRequest,
  getFuelSupplyOrderById,
  acceptFuelSupplyOrder,
  rejectFuelSupplyOrder,
  getAllApprovedFuelSupplyOrders,
  getAllApprovedFuelRequests
};