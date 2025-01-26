const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FuelStoreSchema = new Schema(
  {
    manager_id: { type: Types.ObjectId, ref: "users", required: true }, // Người quản lý kho
    name_storage: { type: String, required: true }, // Tên kho
    is_active: { type: Boolean, required: true, default: true }, // Trạng thái kho
    storage_conditions: { type: String }, // Điều kiện kho
    last_inspection_date: { type: Date }, // Ngày kiểm tra lần cuối
    location: { type: String }, // Vị trí kho
    remaining_capacity: { type: Number, required: true }, // Sức chứa còn lại
    capacity: { type: Number, required: true }, // Tổng sức chứa
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelStorage = mongoose.model("fuel_storages", FuelStoreSchema);
module.exports = FuelStorage;
