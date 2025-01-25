const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const SupplierSchema = new Schema(
  {
    full_name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: { type: String, required: true }, // Bỏ unique nếu không cần duy nhất
    password: { type: String, required: true }, // Nên hash trước khi lưu
    avatar: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    is_blocked: { type: Boolean, default: false },
    birth_day: { type: Date },
    is_deleted: { type: Boolean, default: false },
    role_id: { type: Types.ObjectId, ref: "Role", required: true },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);


const Supplier = mongoose.model("Supplier", SupplierSchema);
module.exports = Supplier;
