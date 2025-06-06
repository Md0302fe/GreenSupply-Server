const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FuelStorageReceiptSchema = new Schema(
  {
    manager_id: { type: Types.ObjectId, ref: "users", required: true },
    storage_id: { type: Types.ObjectId, ref: "storages", required: true },
    status: { type: String, enum: ["Nhập kho thành công", "Chờ duyệt", "Đã duyệt", "Đã huỷ"], default: "Chờ duyệt" },
    storage_date: { type: Date, default: "" },
    is_deleted: { type: Boolean, default: false },
    receipt_supply_id: { type: Types.ObjectId, ref: "material_provide_requests", default: null },
    receipt_request_id: { type: Types.ObjectId, ref: "material_collection_requests", default: null },
    quantity: { type: Number, required: true }, // 🆕 Thêm số lượng nhiên liệu nhập vào
  },
  { timestamps: true }
);

const FuelStorageReceipt = mongoose.model("storage_receipts", FuelStorageReceiptSchema);
module.exports = FuelStorageReceipt;
