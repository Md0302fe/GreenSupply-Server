const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const fuelEntryDetailSchema = new Schema(
  {
    request_id: {
      type: Types.ObjectId,
      ref: "Admin_Fuel_Entry",
      required: true,
    }, // ID yêu cầu nhập nhiên liệu
    start_received: { type: Date, required: true }, // Thời gian nhận nhiên liệu (sửa kiểu String -> Date)
    end_received: { type: Date, required: true }, // Thời gian kết thúc nhận nhiên liệu (sửa kiểu String -> Date)
    is_deleted: { type: Boolean, default: false }, // Trạng thái xóa
    price: { type: Number, required: true }, // Giá mỗi đơn vị
    remaining_quantity: { type: Number, required: true }, // Số lượng còn lại
    priority: { type: Number, required: true, min: 1, max: 5 }, // Mức độ ưu tiên (có thể sử dụng giá trị từ 1 đến 5)
    status: { type: String, required: true },
    note: { type: String, default: "" }, // Ghi chú
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelEntryDetail = mongoose.model(
  "Fuel_Entry_Detail",
  fuelEntryDetailSchema
);
module.exports = FuelEntryDetail;
