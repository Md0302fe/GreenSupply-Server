const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    masanpham: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    type_material_id: {
      type: Types.ObjectId,
      ref: "material_managements",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: 0,
    },
    origin_production_request_id: {
      type: Types.ObjectId,
      ref: "production_requests",
      required: true,
    },
    // Ngày tạo hàng
    created_date: { type: String, required: true },
    // Ngày hết hạng
    expiration_date: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["còn hạn", "hết hạn", "đang giao hàng"],
      default: "còn hạn",
    },
    certifications: {
      type: [String], // sửa luôn default là mảng
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("products", ProductSchema);

module.exports = ProductModel;
