// services/ProductService.js

const product = require("../models/Products");
// const CategoryModel = require("../models/CategoryModel");

// Tạo sản phẩm mới
const createProduct = async (productData) => {
  try {
    const newProduct = new product(productData);
    await newProduct.save();
    return { status: "SUCCESS", product: newProduct };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Cập nhật sản phẩm
const updateProduct = async (id, data) => {
  try {
    const updatedProduct = await product.findByIdAndUpdate(id, data, { new: true });
    if (!updatedProduct) {
      throw new Error("Product not found");
    }
    return { status: "SUCCESS", product: updatedProduct };
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
    return { status: "SUCCESS", product: deletedProduct };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy chi tiết sản phẩm
const getDetailProduct = async (id) => {
  try {
    const product = await product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return { status: "SUCCESS", product };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy tất cả sản phẩm
const getAllProduct = async (limit = 8, page = 0, sort, filter) => {
  try {
    const products = await product.find(filter)
      .sort(sort)
      .limit(limit)
  
    return { status: "SUCCESS", products };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Xóa nhiều sản phẩm
const deleteManyProduct = async (ids) => {
  try {
    const deletedProducts = await product.deleteMany({ _id: { $in: ids } });
    return { status: "SUCCESS", deletedCount: deletedProducts.deletedCount };
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
  deleteProduct,
  getDetailProduct,
  getAllProduct,
  deleteManyProduct,
  searchProductByName
};
