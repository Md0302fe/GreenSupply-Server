const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const adminFuelEntrySchema = new Schema(
  {
    request_name: { type: String, required: true }, // Tên yêu cầu
    fuel_name: { type: String, required: true }, // Tên nhiên liệu
    fuel_type: { type: Types.ObjectId, ref: "FuelType", required: true }, // Loại nhiên liệu
    fuel_image: { type: String, required: true }, // Hình ảnh nhiên liệu
    quantity: { type: Number, required: true, min: 0 }, // Số lượng nhiên liệu (không âm)
    due_date: { type: Date, required: true }, // Ngày cần hoàn thành chỉ tiêu
    is_deleted: { type: Boolean, default: false }, // Trạng thái xóa
    estimate_price: { type: Number, required: true, min: 0 }, // Giá ước tính mỗi đơn vị (không âm)
    status: { type: String, required: true },
    note: { type: String, default: "" }, // Ghi chú
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const AdminFuelEntry = mongoose.model(
  "AdminFuelEntry", // Đổi tên model để khớp với tên schema
  adminFuelEntrySchema
);

module.exports = AdminFuelEntry;
