const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const adminFuelEntrySchema = new Schema(
  {
    request_name: { type: String, required: true }, // Tên yêu cầu
    fuel_type: { type: Types.ObjectId, ref: "fuel_types", required: true }, // Loại nhiên liệu
    fuel_image: { type: String, required: true }, // Hình ảnh nhiên liệu
    quantity: { type: Number, required: true, min: 1 }, // Số lượng nhiên liệu (không âm)
    quantity_remain: { type: Number, required: true, min: 0 }, // Số lượng nhiên liệu (không âm)
    due_date: { type: Date, required: true }, // Ngày cần hoàn thành chỉ tiêu
    start_received: { type: Date, required: true }, // Thời gian nhận nhiên liệu (sửa kiểu String -> Date)
    end_received: { type: Date, required: true }, // Thời gian kết thúc nhận nhiên liệu (sửa kiểu String -> Date)
    price: { type: Number, required: true, min: 1 }, // Giá mỗi đơn vị
    priority: { type: Number, required: true, min: 1, max: 3 }, // Mức độ ưu tiên (có thể sử dụng giá trị từ 1 đến 3)
    total_price : { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["Chờ duyệt", "Đã duyệt", "Từ chối", "Đã huỷ", "Đã Hoàn Thành"],
      default: "Chờ duyệt",
    }, // Trạng thái yêu cầu
    note: { type: String, default: "" }, // Ghi chú
    is_deleted: { type: Boolean, default: false }, // Trạng thái xóa
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const AdminFuelEntry = mongoose.model(
  "admin_fuel_entrys", // Đổi tên model để khớp với tên schema
  adminFuelEntrySchema
);

module.exports = AdminFuelEntry;
