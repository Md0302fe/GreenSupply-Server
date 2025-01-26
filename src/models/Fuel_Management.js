const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FuelManagementSchema = new Schema(
  {
    fuel_type_id: { type: Types.ObjectId, ref: "fuel_types", required: true },
    quantity: { type: Number, min: 0, max: 2000 }, // Giới hạn số lượng nếu cần thiết
    storage_id: { type: Types.ObjectId, ref: "fuel_storages", required: true },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelManagement = mongoose.model("Fuel_Management", FuelManagementSchema);
module.exports = FuelManagement;
