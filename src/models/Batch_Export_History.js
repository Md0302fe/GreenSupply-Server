const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const BatchExportSchema = new Schema(
  {
    material_export_id: { type: Types.ObjectId, ref: "storage_export", required: true },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const BatchExportHistory = mongoose.model("batch_export_histories", BatchExportSchema);
module.exports = BatchExportHistory;
