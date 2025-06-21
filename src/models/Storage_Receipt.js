const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FuelStorageReceiptSchema = new Schema(
  {
    manager_id: { type: Types.ObjectId, ref: "users" },
    storage_id: { type: Types.ObjectId, ref: "storages", required: true },
    status: {
      type: String,
      enum: ["Nhập kho thành công", "Chờ duyệt", "Đã duyệt", "Đã huỷ"],
      default: "Chờ duyệt",
    },
    storage_date: { type: Date, default: "" },
    is_deleted: { type: Boolean, default: false },
    // receipt for raw material
    receipt_supply_id: {
      type: Types.ObjectId,
      ref: "material_provide_requests",
      default: null,
    },
    receipt_request_id: {
      type: Types.ObjectId,
      ref: "material_collection_requests",
      default: null,
    },
    // receipt for production
    production: { type: Types.ObjectId, ref: "products", default: null },
    quantity: { type: Number, required: true }, // 🆕 Thêm số lượng nhiên liệu nhập vào
    receipt_type: { type: String, required : true , enum: ["1", "2", "3"] , default : "1" }, // 1 material_provide_requests - 2 material_collection_requests - 3 products
  },
  { timestamps: true }
);

const FuelStorageReceipt = mongoose.model(
  "storage_receipts",
  FuelStorageReceiptSchema
);
module.exports = FuelStorageReceipt;
