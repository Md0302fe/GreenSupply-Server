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
    });

    await newSupplyRequest.save();

    // Cập nhật số lượng còn lại của đơn yêu cầu
    const newQuantity = adminRequest.quantity - data.quantity;
    const newStatus = newQuantity === 0 ? "Đã hoàn thành" : adminRequest.status;

    await AdminFuelEntry.findByIdAndUpdate(
      data.request_id,
      { quantity: newQuantity, status: newStatus }, // Cập nhật quantity & status
      { new: true } // Trả về dữ liệu đã cập nhật
    );

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

module.exports = {
  createFuelSupplyRequest,
};
