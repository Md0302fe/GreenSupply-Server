const mongoose = require("mongoose");

const PackageMaterialSchema = new mongoose.Schema(
  {
    package_material_name: {
      type: String,
      required: true,
    },
    storage_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "storages", // Tham chiếu đến quy trình sản xuất
      required: true,
    },
    package_material_categories: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "package_material_categories", // Tham chiếu đến quy trình sản xuất
      required: true,
    },
    package_img: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    is_delete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Tự động tạo `createdAt` & `updatedAt`
);

// Tạo model từ schema
const PackageMaterial = mongoose.model("process_status", PackageMaterialSchema);

module.exports = PackageMaterial;
