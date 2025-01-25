const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FuelManagementSchema = new Schema(
  {
    fuel_type_id: { type: Types.ObjectId, ref: "FuelType", required: true },
    quantity: { type: Number, min: 0, max: 2000 }, // Giới hạn số lượng nếu cần thiết
    storage_id: { type: Types.ObjectId, ref: "FuelStorage", required: true },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelManagement = mongoose.model("FuelManagement", FuelManagementSchema);
module.exports = FuelManagement;
