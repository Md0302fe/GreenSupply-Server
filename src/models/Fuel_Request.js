const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// Bảng yêu cầu thu hàng từ phía supplier
const fuelRequestSchema = new Schema(
  {
    supplier_id: { type: Types.ObjectId, ref: "suppliers", required: true }, // id _ nhà cung cấp
    fuel_name: { type: String, required: true }, // Tên nhiên liệu
    quantity: { type: Number, required: true }, // Số lượng
    price: { type: Number, required: true }, // Giá mỗi đơn vị
    total_price: { type: Number, required: true }, // Tổng giá
    status: { type: String, required: true }, // Trạng thái yêu cầu
    is_deleted: { type: Boolean, default: false }, // Trạng thái xóa
    priority: { type: Number, default: 1 }, // Mức độ ưu tiên (1-5)
    note: { type: String, default: "" }, // Ghi chú
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelRequest = mongoose.model("fuel_requests", fuelRequestSchema);
module.exports = FuelRequest;
