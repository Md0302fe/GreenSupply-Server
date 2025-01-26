const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const fuelSupplyOrderSchema = new Schema(
  {
    supplier_id: { type: Types.ObjectId, ref: "suppliers", required: true }, // Nhà cung cấp
    fuel_name: { type: String, required: true }, // Tên nhiên liệu
    request_id: {
      type: Types.ObjectId,
      ref: "admin_fuel_entrys",
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
    status: { type: String, required: true }, // Trạng thái yêu cầu
    is_deleted: { type: Boolean, default: false }, // Trạng thái xóa
    note: { type: String, default: "" }, // Ghi chú
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelSupplyOrder = mongoose.model(
  "fuel_supply_orders",
  fuelSupplyOrderSchema
);
module.exports = FuelSupplyOrder;
