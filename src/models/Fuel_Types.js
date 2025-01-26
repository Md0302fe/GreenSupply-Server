const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FuelTypesSchema = new Schema(
  {
    type_name: { type: String, required: true, maxlength: 100 }, // Tên loại nhiên liệu
    description: { type: String, required: true, maxlength: 500 }, // Mô tả loại nhiên liệu
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelTypes = mongoose.model("Fuel_Type", FuelTypesSchema);
module.exports = FuelTypes;
