const mongoose = require("mongoose");

const PackageMaterialCategoriesSchema = new mongoose.Schema(
  {
    categories_name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    is_delete: {
      type: Boolean,
      default: false,
    },
    Descriptions: {
      type: String,
      default: null,
    },
  },
  { timestamps: true } // Tự động tạo `createdAt` & `updatedAt`
);

// Tạo model từ schema
const PackageMaterial = mongoose.model(
  "package_material_categories",
  PackageMaterialCategoriesSchema
);

module.exports = PackageMaterial;
