const Order = require("../models/OrderProduction");
const Product = require("../models/Products");
const OrderProduction = require("../models/OrderProduction");

const getAllOrders = async (filters) => {
  try {
    let query = {};

    // Lọc theo user_id
    if (filters.user_id) {
      query.user_id = filters.user_id;
    }

    // Tìm kiếm theo mã đơn hàng hoặc trạng thái
    if (filters.search) {
      query.$or = [
        { orderCode: { $regex: filters.search, $options: "i" } },
        { status: { $regex: filters.search, $options: "i" } }
      ];
    }

    // Lọc theo trạng thái đơn hàng
    if (filters.status) query.status = filters.status;

    // Lọc theo phương thức thanh toán
    if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;

    // Lọc theo tổng tiền
    if (filters.totalMin || filters.totalMax) {
      query.totalAmount = {};
      if (filters.totalMin) query.totalAmount.$gte = Number(filters.totalMin);
      if (filters.totalMax) query.totalAmount.$lte = Number(filters.totalMax);
    }

    // Lọc theo ngày tạo đơn hàng
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    // Lấy danh sách đơn hàng, sắp xếp theo thời gian tạo mới nhất
    const orders = await Order.find(query)
      .populate("user_id", "full_name email phone")
      .sort({ createdAt: -1 });

    return {
      status: "Lấy danh sách đơn hàng thành công!",
      orders,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


const getAllOrdersDetail = async (id) => {
  try {
    const res = await OrderProduction.findById(id);
    if (!res) {
      throw new Error("Order not found");
    }
    return { status: "Get Order Details Successfully!", res };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateOrderStatus = async (id, status) => {
    try {
      // Kiểm tra trạng thái hợp lệ
      const validStatuses = ["Đang xử lý", "Đang vận chuyển", "Đã giao hàng"];
      if (!validStatuses.includes(status)) {
        throw new Error("Trạng thái không hợp lệ");
      }
  
      // Tìm đơn hàng và cập nhật trạng thái
      const order = await OrderProduction.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
      }
  
      return { status: "Cập nhật trạng thái thành công!", order };
    } catch (error) {
      throw new Error(error.message);
    }
  };

module.exports = { getAllOrders,getAllOrdersDetail, updateOrderStatus,};



