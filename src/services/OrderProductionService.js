const Order = require("../models/OrderProduction");
const Product = require("../models/Products");
const OrderProduction = require("../models/OrderProduction");

const createOrderProductions = async (data) => {
  try {
    const { user_id, shippingAddressId, paymentMethod, items } = data;

    if (!user_id || !shippingAddressId || !paymentMethod || !items || items.length === 0) {
      throw new Error("Thiếu dữ liệu bắt buộc! Vui lòng kiểm tra.");
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        throw new Error("Thiếu thông tin sản phẩm trong danh sách đơn hàng!");
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Sản phẩm có ID ${item.productId} không tồn tại!`);
      }

      const totalPrice = product.price * item.quantity;
      totalAmount += totalPrice;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image || "",
        price: product.price,
        quantity: item.quantity,
        totalPrice,
      });
    }

    const newOrder = new Order({
      orderCode: "ORD" + Date.now(),
      user_id,
      items: orderItems,
      totalAmount,
      discount: 0,
      shippingFee: 0,
      taxAmount: 0,
      grandTotal: totalAmount,
      status: "Chờ xác nhận",
      paymentMethod,
      paymentStatus: "Chờ giao dịch",
      shippingAddressId,
      trackingNumber: "",
      expectedDeliveryDate: null,
      deliveryDate: null,
      note: data.note || "",
    });

    await newOrder.save();

    return {
      success: true,
      message: "Đơn hàng đã được tạo thành công!",
      order: newOrder,
    };

  } catch (error) {
    throw new Error(error.message);
  }
};


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

const updateOrderOrderProduction = async (id, data) => {
  try {
    const existingOrder = await OrderProduction.findById(id);

    if (!existingOrder) {
      throw new Error("Đơn hàng sản xuất không tồn tại!");
    }

    if (existingOrder.status !== "Chờ xác nhận") {
      throw new Error("Không thể cập nhật đơn hàng đã được xử lý!");
    }
   
    if (typeof data.price === "number" && typeof data.quantity === "number") {
      data.total_price = data.price * data.quantity;
    }

    const updatedOrder = await OrderProduction.findByIdAndUpdate(id, data, {
      new: true,
    });

    return {
      status: "Cập nhật đơn hàng sản xuất thành công!",
      orderProduction: updatedOrder,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = { getAllOrders,createOrderProductions,getAllOrdersDetail,updateOrderOrderProduction };



