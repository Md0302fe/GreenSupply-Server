const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FuelManagementSchema = new Schema(
  {
    fuel_type_id: { type: Types.ObjectId, ref: "materials", required: true },
    quantity: { type: Number, default: 0 }, // Giới hạn số lượng nếu cần thiết
    storage_id: { type: Types.ObjectId, ref: "storages", required: true },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelManagement = mongoose.model("material_managements", FuelManagementSchema);
module.exports = FuelManagement;
