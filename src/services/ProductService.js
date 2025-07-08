// services/ProductService.js
const moment = require("moment");
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

// Lấy chi tiết sản phẩm = id
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

// get product detail by product Code
const getProductDetailByCode = async (productCode) => {
  try {

    const productDetail = await product
      .find({masanpham : productCode}) // find by product_code
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

    return { status: "Get Product Details Is Successfully!", productDetail};
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




/// Dashboard cho thành phẩm
 const getProductDashboard = async () => {
  const today = moment().startOf("day");
  const sevenDaysLater = moment().add(7, "days").endOf("day");

  //  Lấy tất cả thành phẩm còn trong kho
  const storedProducts = await product.find({ is_storaged: true });

  //  Lấy tất các thành phẩm còn trong kho cũng như là trạng thái của chúng
  const totalProducts = storedProducts.length;
  const validProducts = storedProducts.filter(p => p.status === "còn hạn").length;
  const expiredProducts = storedProducts.filter(p => p.status === "hết hạn").length;
  const shippingProducts = storedProducts.filter(p => p.status === "đang giao hàng").length;

  //  Thành phẩm sắp hết hạn (lấy ngày hiện tại + thêm 7 ngày nếu nằm trong khoảng tg hết hạn thì no sẽ cảnh báo)
  const expiringProductsRaw = storedProducts.filter(p =>
    moment(p.expiration_date, "YYYY-MM-DD").isBetween(today, sevenDaysLater, null, "[]")
  );


  // Lấy danh sách thành phẩm sắp hết hạn
  const expiringProducts = expiringProductsRaw.map(p => ({
    name: p.name,
    masanpham: p.masanpham,
    expiration_date: p.expiration_date,
    days_left: moment(p.expiration_date).diff(today, "days"),
  }));

  //  thành phẩm mới nhất (còn trong kho)
  const latestProducts = await product.find({ is_storaged: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name masanpham createdAt");

  //  Biểu đồ phân bổ loại nguyên liệu
const productByType = await product.aggregate([
  { $match: { is_storaged: true } },
  {
    $group: {
      _id: "$type_material_id",
      totalQuantity: { $sum: "$quantity" },
    },
  },
  {
    $lookup: {
      from: "material_managements",
      localField: "_id",
      foreignField: "_id",
      as: "materialInfo",
    },
  },
  { $unwind: "$materialInfo" },
  {
    $lookup: {
      from: "materials",
      localField: "materialInfo.fuel_type_id",
      foreignField: "_id",
      as: "materialType",
    },
  },
  { $unwind: "$materialType" },
  {
    $project: {
      _id: 1,
      type: "$materialType.type_name", 
      value: "$totalQuantity",         
    },
  },
  { $sort: { value: -1 } },
]);

  //  Lấy các thành phẩm có trường is_storaged là false (được xem là đã xuất kho)
  const exportedProductsCount = await product.countDocuments({ is_storaged: false });

  return {
    totalProducts,
    validProducts,
    expiredProducts,
    shippingProducts,
    expiringSoon: expiringProducts.length,
    latestProducts,
    productByType,
    expiringProducts,
    inStock: storedProducts.length,
    exported: exportedProductsCount
  };
};



module.exports = {
  createProduct,
  updateProduct,
  getProductDetail,
  getAllProduct,
  deleteProduct,
  deleteAllProducts,
  deleteManyProduct,
  searchProductByName,
  getProductDetailByCode,
  getProductDashboard
};
