const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const MaterialsSchema = new Schema(
  {
    type_name: { type: String, required: true, maxlength: 100 }, // Tên loại nhiên liệu
    description: { type: String, required: true, maxlength: 500 }, // Mô tả loại nhiên liệu
    image: { type: String, required: true }, // Image
    is_deleted: { type: Boolean, default: false }, // Trạng thái xóa
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Materials = mongoose.model("materials", MaterialsSchema);
module.exports = Materials;
