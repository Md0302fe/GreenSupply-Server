const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FuelStorageReceiptSchema = new Schema(
  {
    manager_id: { type: Types.ObjectId, ref: "users", required: true }, // Người quản lý kho
    storage_id: { type: Types.ObjectId, ref: "fuel_storages", required: true }, // Tên kho
    status: { type: String, enum: ["Chờ duyệt", "Hoàn Thành", "Đã huỷ"], default: "Chờ duyệt" },
    storage_date: { type: Date, default:""},
    is_deleted: { type: Boolean, default: false },
    receipt_supply_id: { type: Types.ObjectId, ref: "fuel_supply_orders", default: "" },
    receipt_request_id: { type: Types.ObjectId, ref: "fuel_requests", default: ""}
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const FuelStorageReceipt = mongoose.model("fuel_storage_receipts", FuelStorageReceiptSchema);
module.exports = FuelStorageReceipt;
