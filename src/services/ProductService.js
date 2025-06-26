// services/ProductService.js

const product = require("../models/Products");
// const CategoryModel = require("../models/CategoryModel");

// Tạo sản phẩm mới
const createProduct = async (productData) => {
  try {
    const newProduct = new product(productData);
    await newProduct.save();
    return {
      status: "Create New Product Is Successfully!",
      product: newProduct,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Cập nhật sản phẩm
const updateProduct = async (id, data) => {
  try {
    const updatedProduct = await product.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedProduct) {
      throw new Error("Product not found");
    }
    return {
      status: "Update Product Is Successfully!",
      product: updatedProduct,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy chi tiết sản phẩm
const getProductDetail = async (id) => {
  try {
    const productDetail = await product
      .findById(id)
      .populate({
        path: "type_material_id",
        populate: {
          path: "fuel_type_id",
          model: "materials",
        },
      }) 
      .populate("origin_production_request_id");
    if (!productDetail) {
      throw new Error("Product not found");
    }
    return { status: "Get Product Details Is Successfully!", productDetail };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy tất cả sản phẩm
const getAllProduct = async (limit = 8, page = 0, sort = {createdAt : -1}, filter = {}) => {
  try {
    const finalFilter = { ...filter, is_storaged: true };
    const totalCount = await product.countDocuments(finalFilter); // Tổng số sản phẩm

    const products = await product
      .find(finalFilter)
      .populate({
        path: "type_material_id",
        populate: {
          path: "fuel_type_id",
          model: "materials",
        },
      })
      .populate("origin_production_request_id")
      .sort(sort)
      .limit(limit)
      .skip(page * limit);

    return { products, totalCount };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Xóa sản phẩm
const deleteProduct = async (id) => {
  try {
    const deletedProduct = await product.findByIdAndDelete(id);
    if (!deletedProduct) {
      throw new Error("Product not found");
    }
    return {
      status: "Delete Product Is Successfully!",
      product: deletedProduct,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Xóa tất cả sản phẩm
const deleteAllProducts = async () => {
  try {
    const result = await product.deleteMany({});
    return {
      status: "Delete All Products Is Successfully!",
      deletedCount: result.deletedCount, // Trả về số sản phẩm đã bị xóa
    };
  } catch (error) {
    throw new Error("Failed to delete all products: " + error.message);
  }
};

// Xóa nhiều sản phẩm
const deleteManyProduct = async (ids) => {
  try {
    const deletedProducts = await product.deleteMany({ _id: { $in: ids } });
    return {
      status: "Delete Many Products Is Successfully!",
      deletedCount: deletedProducts.deletedCount,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const searchProductByName = async (name) => {
  try {
    const regex = new RegExp(name, "i"); // "i" để không phân biệt hoa thường
    const products = await product.find({ name: regex }); // Sử dụng regex
    return products;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Tạo danh mục mới
// const createCategory = async (categoryData) => {
//   try {
//     const newCategory = new CategoryModel(categoryData);
//     await newCategory.save();
//     return { status: "SUCCESS", category: newCategory };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// Lấy tất cả danh mục
// const getAllCategory = async () => {
//   try {
//     const categories = await CategoryModel.find();
//     return { status: "SUCCESS", categories };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

module.exports = {
  createProduct,
  updateProduct,
  getProductDetail,
  getAllProduct,
  deleteProduct,
  deleteAllProducts,
  deleteManyProduct,
  searchProductByName,
};
