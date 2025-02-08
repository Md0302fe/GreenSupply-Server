const FuelEntryDetail = require("../models/Fuel_Entry_Detail");
const AdminFuelEntry = require("../models/Admin_Fuel_Entry");

const createSupplyRequest = async (data) => {
  try {
    // Kiểm tra request_id hợp lệ
    const adminRequest = await AdminFuelEntry.findById(data.request_id);
    if (!adminRequest) {
      throw new Error("Không tìm thấy yêu cầu nhập hàng với ID: " + data.request_id);
    }

    // Kiểm tra số lượng hợp lệ
    if (data.remaining_quantity > adminRequest.quantity) {
      throw new Error("Số lượng cung cấp vượt quá số lượng yêu cầu!");
    }

    // Kiểm tra giá hợp lệ
    if (!data.price || typeof data.price !== "number" || data.price <= 0) {
      throw new Error("Giá phải là số nguyên dương!");
    }

    // Kiểm tra dữ liệu ngày nhận hàng (từ Date Picker)
    if (!data.start_received || !data.end_received) {
      throw new Error("Vui lòng chọn ngày bắt đầu và ngày kết thúc!");
    }

    // Chuyển đổi dữ liệu từ frontend thành `Date`
    const startReceivedDate = new Date(data.start_received);
    const endReceivedDate = new Date(data.end_received);

    // Kiểm tra ngày hợp lệ
    if (startReceivedDate >= endReceivedDate) {
      throw new Error("Ngày bắt đầu phải trước ngày kết thúc!");
    }

    // Tạo yêu cầu cung cấp hàng
    const newSupplyRequest = new FuelEntryDetail({
      request_id: data.request_id,
      start_received: startReceivedDate,
      end_received: endReceivedDate,
      price: data.price,
      remaining_quantity: data.remaining_quantity,
      priority: data.priority || 1,
      status: "Chờ duyệt",
      note: data.note || ""
    });

    await newSupplyRequest.save();

    return {
      message: "Yêu cầu cung cấp hàng đã được tạo thành công!",
      supplyRequest: newSupplyRequest
    };

  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createSupplyRequest,
};
