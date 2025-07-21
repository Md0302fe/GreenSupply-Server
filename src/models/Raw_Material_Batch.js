const mongoose = require("mongoose");
const { Schema, Types } = mongoose;


const RawMaterialBatchSchema = new Schema(
  {
    batch_id: { type: String, required: true, unique: true },
    batch_name: { type: String, required: true },
    fuel_type_id: { type: Types.ObjectId, ref: "material_managements", required: true },
    production_request_id: { type: Types.ObjectId, ref: "production_requests", required: true },
    status: {
      type: String,
      enum: ["Đang chuẩn bị", "Chờ xuất kho", "Đã xuất kho", "Hủy bỏ"],
      default: "Đang chuẩn bị",
    },
    quantity: { type: Number, required: true, default: 0 },
    storage_id: { type: Types.ObjectId, ref: "storages", required: false },
    note: {type: String, default: "", trim: true},
    is_automatic: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// RawMaterialBatchSchema.index({ batch_id: 1 }, { unique: true });
const RawMaterialBatch = mongoose.model(
  "raw_material_batchs",
  RawMaterialBatchSchema
);

module.exports = RawMaterialBatch;
