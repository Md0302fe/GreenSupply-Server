const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const userAddressSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true },
    full_name: { type: String, required: true }, // Tên người nhận
    company_name: { type: String, default: "" }, // Tên công ty (nếu có)
    address: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    phone: { type: String, required: true },
    note: { type: String, default: "" },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const UserAddress = mongoose.model("UserAddress", userAddressSchema);
module.exports = UserAddress;
