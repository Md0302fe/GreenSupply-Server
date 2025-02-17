const AdminFuelEntry = require("../models/Admin_Fuel_Entry");
const Fuel_Supply_Order = require("../models/Fuel_Supply_Order");

const createFuelSupplyRequest = async (data) => {
  try {
    // Lấy đơn yêu cầu từ Admin
    const adminRequest = await AdminFuelEntry.findById(data.request_id);
    if (!adminRequest) {
      throw new Error("Không tìm thấy yêu cầu nhập hàng với ID: " + data.request_id);
    }
    // Tạo đơn cung cấp nhiên liệu
    const newSupplyRequest = new Fuel_Supply_Order({
      supplier_id: data.supplier_id,
      request_id: data.request_id,
      fuel_name: data.fuel_name,
      price: data.price,
      total_price: data.total_price,
      quantity: data.quantity,
      quality: data.quality,
      status: "Chờ duyệt",
      note: data.note || "",
      fuel_type: data.fuel_type || "",
    });

    await newSupplyRequest.save();

    // Cập nhật số lượng còn lại của đơn yêu cầu
    // const newQuantity = adminRequest.quantity_remain - data.quantity;
    // const newStatus = newQuantity === 0 ? "Đã hoàn thành" : adminRequest.status;

    // await AdminFuelEntry.findByIdAndUpdate(
    //   data.request_id,
    //   { quantity_remain: newQuantity, status: newStatus }, // Cập nhật quantity & status
    //   { new: true } // Trả về dữ liệu đã cập nhật
    // );

    return {
      success: true,
      message: "Yêu cầu cung cấp hàng đã được tạo thành công!",
      supplyRequest: newSupplyRequest,
    };

  } catch (error) {
    return {
      success: false,
      message: "Lỗi khi tạo yêu cầu cung cấp hàng",
      error: error.message,
    };
  }
};
const getAllFuelSupplyRequest = async (filters) => {
  try {
    let query = { is_deleted: false };

    // Lấy theo user
    if (filters.user_id) {
      query.supplier_id = filters.user_id;
    }

    // tìm kiếm
    if (filters.search) {
      query.$or = [
        { fuel_name: { $regex: filters.search, $options: "i" } },
        { address: { $regex: filters.search, $options: "i" } }
      ];
    }

    // filter
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = Number(filters.priority);

    // giá
    if (filters.priceMin || filters.priceMax) {
      query.price = {};
      if (filters.priceMin) query.price.$gte = Number(filters.priceMin);
      if (filters.priceMax) query.price.$lte = Number(filters.priceMax);
    }

    // số lượng
    if (filters.quantityMin || filters.quantityMax) {
      query.quantity = {};
      if (filters.quantityMin) query.quantity.$gte = Number(filters.quantityMin);
      if (filters.quantityMax) query.quantity.$lte = Number(filters.quantityMax);
    }

    // kết quả
    const requests = await Fuel_Supply_Order.find(query)
      .populate("supplier_id", "full_name email phone")
      .sort({ createdAt: -1 });

    return {
      status: "Lấy danh sách yêu cầu cung hàng thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


// Hủy yêu cầu thu hàng (Chỉ khi trạng thái là "Chờ duyệt")
const deleteFuelSupplyRequest = async (id) => {
  try {
    const request = await Fuel_Supply_Order.findByIdAndDelete(id);

    return {
      success: true,
      message: "Xóa đơn cung cấp thành công!",
      harvestRequest: request.toObject(), // Trả về dữ liệu sạch hơn
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || error,
    };
  }
};

// Cập nhật thông tin yêu cầu thu hàng (chỉ khi trạng thái là "Chờ duyệt")
const updateFuelSupplyRequest = async (id, data) => {
  try {
    const existingRequest = await Fuel_Supply_Order.findById(id);

    if (!existingRequest) {
      throw new Error("Yêu cầu thu hàng không tồn tại!");
    }

    if (existingRequest.status !== "Chờ duyệt") {
      throw new Error("Không thể cập nhật đơn hàng đã được xử lý!");
    }

    if (data.address && data.address.trim() === "") {
      throw new Error("Địa chỉ nhận hàng không được để trống!");
    }

    if (typeof data.price === "number" && typeof data.quantity === "number") {
      data.total_price = data.price * data.quantity;
    }

    const updatedRequest = await Fuel_Supply_Order.findByIdAndUpdate(id, data, {
      new: true,
    });

    return {
      status: "Cập nhật yêu cầu thu hàng thành công!",
      harvestRequest: updatedRequest,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createFuelSupplyRequest,
  getAllFuelSupplyRequest,
  deleteFuelSupplyRequest,
  updateFuelSupplyRequest
};
