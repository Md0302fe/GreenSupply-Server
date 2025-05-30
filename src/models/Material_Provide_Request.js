const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const materialProvideRequestSchema = new Schema(
  {
    supplier_id: { type: Types.ObjectId, ref: "users", required: true }, // Nhà cung cấp
    fuel_name: { type: String, required: true }, // Tên nhiên liệu
    request_id: {
      type: Types.ObjectId,
      ref: "purchase_material_plans",
      required: true,
    }, // ID nhập nhiên liệu
    quantity: { type: Number, required: true }, // Số lượng nhiên liệu
    quality: { type: String, required: true }, // Chất lượng nhiên liệu
    price: { type: Number, required: true }, // Giá mỗi đơn vị
    total_price: {
      type: Number,
      required: true,
      validate: {
        validator: function () {
          return this.total_price === this.quantity * this.price;
        },
        message: "Tổng giá phải bằng số lượng x đơn giá.",
      },
    }, // Tổng giá (kiểm tra tính đúng)
    address: { type: String, required: true },
    status: { type: String, required: true }, // Trạng thái yêu cầu
    is_deleted: { type: Boolean, default: false }, // Trạng thái xóa
    note: { type: String, default: "" }, // Ghi chú
    fuel_type: { type: String, default: "" },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelSupplyOrder = mongoose.model(
  "material_provide_requests",
  materialProvideRequestSchema
);
module.exports = FuelSupplyOrder;
