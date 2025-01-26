const mongoose = require("mongoose");
const { Schema } = mongoose;

const roleSchema = new Schema(
  {
    role_name: {
      type: String,
      required: true, // Bắt buộc phải có tên vai trò
      unique: true,   // Đảm bảo tên vai trò không trùng lặp
      trim: true,     // Loại bỏ khoảng trắng thừa
    },
    description: { type: String, default: "" }, // Mô tả vai trò (nếu cần)
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Role = mongoose.model("roles", roleSchema);
module.exports = Role;
