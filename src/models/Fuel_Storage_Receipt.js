const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FuelStorageReceiptSchema = new Schema(
  {
    manager_id: { type: Types.ObjectId, ref: "users", required: true },
    storage_id: { type: Types.ObjectId, ref: "fuel_storages", required: true },
    status: { type: String, enum: ["Chờ duyệt", "Đã duyệt", "Đã huỷ"], default: "Chờ duyệt" },
    storage_date: { type: Date, default: "" },
    is_deleted: { type: Boolean, default: false },
    receipt_supply_id: { type: Types.ObjectId, ref: "fuel_supply_orders", default: null },
    receipt_request_id: { type: Types.ObjectId, ref: "fuel_requests", default: null },
    quantity: { type: Number, required: true }, // 🆕 Thêm số lượng nhiên liệu nhập vào
  },
  { timestamps: true }
);

const FuelStorageReceipt = mongoose.model("fuel_storage_receipts", FuelStorageReceiptSchema);
module.exports = FuelStorageReceipt;
