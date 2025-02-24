const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");

///GetAll cả 2 bảng 
const getAllApprovedRequests = async () => {
  try {
    // Lấy danh sách từ bảng FuelRequest (Yêu cầu thu hàng)
    const approvedFuelRequests = await FuelRequest.find({
      status: "Đã duyệt",
      is_deleted: false,
    })
      .populate("supplier_id")
      .lean(); // Chuyển dữ liệu từ mongoose document sang object thuần

    // Lấy danh sách từ bảng FuelSupplyOrder (Đơn cung cấp nhiên liệu)
    const approvedFuelSupplyOrders = await FuelSupplyOrder.find({
      status: "Đã duyệt",
      is_deleted: false,
    })
      .populate("supplier_id request_id")
      .lean();
    
    // 🟢 Thêm `receipt_type` vào từng đơn hàng
    const formattedFuelRequests = approvedFuelRequests.map((order) => ({
      ...order,
      receipt_type: "request", // Đánh dấu đây là đơn thu hàng
    }));

    const formattedFuelSupplyOrders = approvedFuelSupplyOrders.map((order) => ({
      ...order,
      receipt_type: "supply", // Đánh dấu đây là đơn cung cấp nhiên liệu
    }));

    // Gộp kết quả từ cả hai bảng
    const allApprovedOrders = [...formattedFuelRequests, ...formattedFuelSupplyOrders];

    return {
      success: true,
      data: allApprovedOrders,
    };
  } catch (error) {
    throw error;
  }
};

const getAllProvideOrders = async (filters) => {
  try {
    let query = { is_deleted: false };

    if (filters.search) {
      query.$or = [
        { fuel_name: { $regex: filters.search, $options: "i" } },
        { address: { $regex: filters.search, $options: "i" } }
      ];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = Number(filters.priority);
    }

    if (filters.priceMin || filters.priceMax) {
      query.price = {};
      if (filters.priceMin) query.price.$gte = Number(filters.priceMin);
      if (filters.priceMax) query.price.$lte = Number(filters.priceMax);
    }

    if (filters.quantityMin || filters.quantityMax) {
      query.quantity = {};
      if (filters.quantityMin) query.quantity.$gte = Number(filters.quantityMin);
      if (filters.quantityMax) query.quantity.$lte = Number(filters.quantityMax);
    }

    const requests = await FuelSupplyOrder.find(query)
      .populate("supplier_id", "full_name email phone")
      .sort({ createdAt: -1 });

    return {
      status: "Lấy danh sách yêu cầu thu hàng thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/// Lấy tất cả các yêu cầu thu hàng từ bảng FuelRequest
const getAllApprovedFuelRequests = async () => {
  try {
    const approvedFuelRequests = await FuelRequest.find({
      status: "Đã duyệt",
      is_deleted: false,
    })
      .populate("supplier_id")
      .lean();

    // 🟢 Thêm `receipt_type`
    const formattedRequests = approvedFuelRequests.map((order) => ({
      ...order,
      receipt_type: "request",
    }));

    return {
      success: true,
      data: formattedRequests,
    };
  } catch (error) {
    throw error;
  }
};


/// Lấy tất cả các đơn cung cấp nhiên liệu từ bảng FuelSupplyOrder
const getAllApprovedFuelSupplyOrders = async () => {
  try {
    const approvedFuelSupplyOrders = await FuelSupplyOrder.find({
      status: "Đã duyệt",
      is_deleted: false,
    })
      .populate("supplier_id request_id")
      .lean();

    // 🟢 Thêm `receipt_type`
    const formattedSupplyOrders = approvedFuelSupplyOrders.map((order) => ({
      ...order,
      receipt_type: "supply",
    }));

    return {
      success: true,
      data: formattedSupplyOrders,
    };
  } catch (error) {
    throw error;
  }
};


module.exports = { 
  getAllApprovedFuelRequests, 
  getAllApprovedRequests,
  getAllApprovedFuelSupplyOrders,
  getAllProvideOrders,
  // getAllorderbySucess
};
