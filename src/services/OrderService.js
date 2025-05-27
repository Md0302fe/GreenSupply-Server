const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");
const mongoose = require("mongoose");

///GetAll cả 2 bảng 
// const getAllApprovedRequests = async () => {
//   try {
//     // Lấy danh sách từ bảng FuelRequest (Yêu cầu thu hàng)
//     const approvedFuelRequests = await FuelRequest.find({
//       status: "Đã duyệt",
//       is_deleted: false,
//     })
//       .populate("supplier_id")
//       .lean(); // Chuyển dữ liệu từ mongoose document sang object thuần

//     // Lấy danh sách từ bảng FuelSupplyOrder (Đơn cung cấp nhiên liệu)
//     const approvedFuelSupplyOrders = await FuelSupplyOrder.find({
//       status: "Đã duyệt",
//       is_deleted: false,
//     })
//       .populate("supplier_id request_id")
//       .lean();
    
//     // 🟢 Thêm `receipt_type` vào từng đơn hàng và đổi trạng thái thành "Chờ Nhập Kho"
//     const formattedFuelRequests = approvedFuelRequests.map((order) => ({
//       ...order,
//       receipt_type: "request", // Đánh dấu đây là đơn thu hàng
//       status: "Chờ Nhập Kho",  // ✅ Đổi trạng thái ngay tại đây
//     }));

//     const formattedFuelSupplyOrders = approvedFuelSupplyOrders.map((order) => ({
//       ...order,
//       receipt_type: "supply", // Đánh dấu đây là đơn cung cấp nhiên liệu
//       status: "Chờ Nhập Kho",  // ✅ Đổi trạng thái ngay tại đây
//     }));

//     // Gộp kết quả từ cả hai bảng
//     const allApprovedOrders = [...formattedFuelRequests, ...formattedFuelSupplyOrders];

//     return {
//       success: true,
//       data: allApprovedOrders,
//     };
//   } catch (error) {
//     throw error;
//   }
// };


const getAllApprovedRequests = async () => {
  try {
      const approvedFuelRequests = await FuelRequest.find({
          status: { $in: ["Đã duyệt"] }, 
          is_deleted: false,
      }).populate("supplier_id").lean();

      const approvedFuelSupplyOrders = await FuelSupplyOrder.find({
          status: { $in: ["Đã duyệt"] }, 
          is_deleted: false,
      }).populate("supplier_id request_id").lean();

      const formattedFuelRequests = approvedFuelRequests.map(order => ({
          ...order,
          status: order.status === "Đã duyệt" ? "Chờ Nhập Kho" : "Đang xử lý", 
          receipt_type: "request",
      }));

      const formattedFuelSupplyOrders = approvedFuelSupplyOrders.map(order => ({
          ...order,
          status: order.status === "Đã duyệt" ? "Chờ Nhập Kho" : "Đang xử lý", 
          receipt_type: "supply",
      }));

      const allApprovedOrders = [...formattedFuelRequests, ...formattedFuelSupplyOrders];

      return { success: true, data: allApprovedOrders };
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
       status: "Chờ Nhập Kho",
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
       status: "Chờ Nhập Kho",
    }));

    return {
      success: true,
      data: formattedSupplyOrders,
    };
  } catch (error) {
    throw error;
  }
};

const updateOrderStatus = async (req, res) => {
  try {
      const { id } = req.params; // ID đơn hàng từ URL
      const { status } = req.body; // Trạng thái mới từ request body

      // Kiểm tra trạng thái hợp lệ
      const validStatuses = ["Chờ Nhập Kho", "Đang xử lý", "Đã hoàn thành"];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ!" });
      }

      // Kiểm tra xem đơn hàng tồn tại không
      let order = await FuelRequest.findById(id);
      if (!order) {
          order = await FuelSupplyOrder.findById(id);
      }

      if (!order) {
          return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
      }

      // Cập nhật trạng thái đơn hàng
      order.status = status;
      await order.save();

      return res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công!", data: order });
  } catch (error) {
      return res.status(500).json({ success: false, message: "Lỗi khi cập nhật trạng thái!", error: error.message });
  }
};

const SupplierOrderDashboard = async () => {

  const totalFuelRequests = await FuelRequest.countDocuments({ is_deleted: false });
  const totalFuelSupplyOrders = await FuelSupplyOrder.countDocuments({ is_deleted: false });

  const pendingFuelRequests = await FuelRequest.countDocuments({ status: "Chờ duyệt", is_deleted: false });
  const pendingFuelSupplyOrders = await FuelSupplyOrder.countDocuments({ status: "Chờ duyệt", is_deleted: false });

  const approvedFuelRequests = await FuelRequest.countDocuments({ status: "Đã duyệt", is_deleted: false });
  const approvedFuelSupplyOrders = await FuelSupplyOrder.countDocuments({ status: "Đã duyệt", is_deleted: false });

  const completedFuelRequests = await FuelRequest.countDocuments({ status: "Hoàn thành", is_deleted: false });
  const completedFuelSupplyOrders = await FuelSupplyOrder.countDocuments({ status: "Hoàn thành", is_deleted: false });


  return {
      // Tổng hợp tất cả dữ liệu của 2 bảng
    totalFuelRequests,
    totalFuelSupplyOrders,
    pendingRequests: pendingFuelRequests + pendingFuelSupplyOrders,
    approvedRequests: approvedFuelRequests + approvedFuelSupplyOrders,
    totalCompleted: completedFuelRequests + completedFuelSupplyOrders,

    // Chi tiết từng bảng
    fuelRequests: {
      total: totalFuelRequests,
      pending: pendingFuelRequests,
      approved: approvedFuelRequests,
      completed: completedFuelRequests
    },
    fuelSupplyOrders: {
      total: totalFuelSupplyOrders,
      pending: pendingFuelSupplyOrders,
      approved: approvedFuelSupplyOrders,
      completed: completedFuelSupplyOrders
    }
  };
};


const getProvideOrderHistories = async (user_id) => {
  try {

    // cast id to objectId before compare with data in mgdb
    const objectUserId = new mongoose.Types.ObjectId(user_id.user_id);

    // const requests = await FuelSupplyOrder.find({status : "Hoàn Thành"})
    const requests = await FuelSupplyOrder.find({
      supplier_id : objectUserId,
      is_deleted : false 
    })
      .populate("supplier_id", "full_name email phone")
      .sort({ createdAt: -1 });

    console.log("provide orders => ", requests)
    return {
      status: "Lấy danh sách yêu cầu thu hàng thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { 
  getAllApprovedFuelRequests, 
  getAllApprovedRequests,
  getAllApprovedFuelSupplyOrders,
  getAllProvideOrders,
  updateOrderStatus,
  SupplierOrderDashboard,
  getProvideOrderHistories
  // getAllorderbySucess
};
