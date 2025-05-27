const mongoose = require("mongoose");

const MaterialStorageExportSchema = new mongoose.Schema(
  {
    production_request_id: {type: mongoose.Schema.Types.ObjectId, ref: "production_requests", required: true},
    batch_id: {type: mongoose.Schema.Types.ObjectId, ref: "raw_material_batchs", required: true},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
    export_name: {type: String, required: true, trim: true},
    type_export: {type: String, enum: ["Đơn sản xuất"], default: "Đơn sản xuất", required: true},
    note: {type: String, default: "", trim: true},
    status: {type: String, enum: ["Chờ duyệt", "Hoàn thành"], default: "Chờ duyệt"},
    is_deleted: {type: Boolean, default: false},
  },
  { timestamps: true }
);

const MaterialStorageExport = mongoose.model("storage_export", MaterialStorageExportSchema);
module.exports = MaterialStorageExport;