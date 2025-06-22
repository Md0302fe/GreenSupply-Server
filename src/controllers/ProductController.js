const JwtService = require("../services/JwtService");
const ProductService = require("../services/ProductService");
const fs = require("fs");
const path = require("path");

// // Phương Thức Khởi Tạo 1 New Product
// const createProduct = async (req, res) => {
//   try {
//     const { name, masanpham, image, type, price, description } = req.body;

//     const imagePath = `src/uploads/${masanpham.toLowerCase()}-1.png`;

//     // Kiểm tra các trường bắt buộc
//     if (!name || !masanpham || !image || !type || !price) {
//       return res.status(200).json({
//         status: "ERROR",
//         message: "Thông tin sản phẩm không hợp lệ",
//       });
//     }

//     // Gọi service để lưu sản phẩm
//     const response = await ProductService.createProduct({
//       name,
//       masanpham,
//       image: imagePath,
//       type,
//       price,
//       description, // Trường không bắt buộc
//     });

//     // Trả về phản hồi thành công
//     return res.status(200).json(response);
//   } catch (error) {
//     // Log lỗi và trả về phản hồi lỗi
//     console.error("Error in createProduct:", error);
//     return res.status(500).json({
//       status: "ERROR",
//       message: "Lỗi trong quá trình tạo sản phẩm",
//       eMsg: error.message,
//     });
//   }
// };

const createProduct = async (req, res) => {
  try {
    const {
      name,
      masanpham,
      image,
      type,
      price,
      oldPrice,
      description,
      quantity,
      origin,
      certifications,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !masanpham || !type || !price) {
      return res.status(400).json({
        status: "ERROR",
        message: "Thông tin sản phẩm không hợp lệ",
      });
    }

    // Thư mục chứa ảnh
    const uploadsDir = path.join(__dirname, "../assets/product-image");
    console.log("Uploads Directory:", uploadsDir);

    // Duyệt thư mục để kiểm tra file khớp
    const files = fs.readdirSync(uploadsDir);
    console.log("Files in uploads directory:", files);

    // Chuyển đổi `name` thành tên file cần tìm
    const formattedName = formatFileName(name);
    const matchedFile = files.find((file) =>
      file.toLowerCase().includes(formattedName)
    );

    // Nếu tìm thấy file ảnh khớp, thay thế `image`
    let finalImagePath = image; // Mặc định lấy từ dữ liệu client gửi
    if (matchedFile) {
      finalImagePath = `product-image/${matchedFile}`;
    } else {
      console.warn(`Không tìm thấy file ảnh khớp cho sản phẩm: ${name}`);
    }

    // Gọi service để lưu sản phẩm
    const newProduct = await ProductService.createProduct({
      name,
      masanpham,
      image: finalImagePath, // Lưu đường dẫn cuối cùng vào DB
      type,
      price,
      oldPrice,
      description,
      quantity,
      origin,
      certifications,
    });

    return res.status(201).json({
      status: "SUCCESS",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi trong quá trình tạo sản phẩm",
      eMsg: error.message,
    });
  }
};

// Hàm chuyển đổi tên thành định dạng file
function formatFileName(name) {
  return name
    .normalize("NFD") // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .replace(/\s+/g, "") // Loại bỏ khoảng trắng
    .toLowerCase(); // Chuyển thành chữ thường
}

// Phương Thức Update Thông Tin Của Product
const updateProduct = async (req, res) => {
  try {
    // Lấy được id product thông qua URL (/product-user/:id) / get = params
    const productId = req.params.id;
    const data = req.body;
    if (!productId) {
      res.status(200).json({
        status: "ERROR",
        message: "The Product Id is required !",
      });
    }
    const respone = await ProductService.updateProduct(productId, data);
    // Log API Check
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const response = await ProductService.getProductDetail(productId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProductDetail,
};

// Phương Thức Delele User
const deleteProduct = async (req, res) => {
  try {
    // Lấy được id người dùng thông qua URL (/update-user/:id) / get = params
    const productId = req.params.id;
    if (!productId) {
      res.status(200).json({
        status: "ERROR",
        message: "The Product id is required !",
      });
    }

    const respone = await ProductService.deleteProduct(productId);
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương thức xóa tất cả sản phẩm
const deleteAllProducts = async (req, res) => {
  try {
    const deleteAllProducts = await ProductService.deleteAllProducts();
    return res.status(200).json({
      status: "SUCCESS",
      message: "All products have been deleted successfully!",
      data: deleteAllProducts, // Có thể trả về số sản phẩm đã xóa hoặc danh sách các sản phẩm bị xóa
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while deleting all products.",
      eMsg: error.message,
    });
  }
};

// Phương Thức DELETE Many
const deleteManyProduct = async (req, res) => {
  try {
    // Lấy được id người dùng thông qua URL (/update-user/:id) / get = params
    const ids = req.body;
    if (!ids) {
      res.status(200).json({
        status: "ERROR",
        message: "The Product ids is required !",
      });
    }

    const respone = await ProductService.deleteManyProduct(ids);

    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Get All PRODUCT
// const getAllProduct = async (req, res) => {
//   try {
//     // Lưu ý , với mỗi key query được sử dụng 2 lần thì nó sẽ có dạng array []
//     const { limit, page, sort, filter } = req.query;

//     const respone = await ProductService.getAllProduct(
//       +limit || 6,
//       +page || 0,
//       sort,
//       filter
//     );

//     // Log API Check
//     return res.status(200).json(respone);
//   } catch (error) {
//     return res.status(404).json({
//       eMsg: error,
//     });
//   }
// };

const getAllProduct = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;
    const parsedFilter =
      typeof filter === "string" ? JSON.parse(filter) : filter || {};

    const { products, totalCount } = await ProductService.getAllProduct(
      +limit || 8,
      +page || 0,
      sort,
      parsedFilter
    );

    return res.status(200).json({
      status: "SUCCESS",
      products,
      totalCount, // ✅ Trả về tổng số bản ghi
    });
  } catch (error) {
    console.error("Lỗi trong getAllProduct:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Không thể tải dữ liệu sản phẩm!",
    });
  }
};

// Phương Thức Search Product
const searchProduct = async (req, res) => {
  try {
    const { name } = req.query; // Lấy từ khóa tìm kiếm từ query string
    if (!name) {
      return res.status(400).json({
        status: "ERROR",
        message: "Vui lòng cung cấp từ khóa tìm kiếm",
      });
    }
    const trimmedName = name.trim();
    // Tìm kiếm sản phẩm theo tên, không phân biệt hoa thường
    const products = await ProductService.searchProductByName(trimmedName);
    return res.status(200).json({
      status: "SUCCESS",
      products,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi trong quá trình tìm kiếm",
      eMsg: error.message,
    });
  }
};

// Phương Thức Khởi Tạo 1 New Category
// const createCategory = async (req, res) => {
//   try {
//     const { name } = req.body;

//     if (!name) {
//       return res.status(200).json({
//         status: "ERROR",
//         message: "Tên loại hàng không hợp lệ",
//       });
//     }

//     const respone = await ProductService.createCategory(req.body);
//     // Log ra API check ,
//     return res.status(200).json(respone);
//   } catch (error) {
//     return res.status(404).json({
//       eMsg: error,
//     });
//   }
// };

// Phương Thức Get All PRODUCT
// const getAllCategory = async (req, res) => {
//   try {
//     // Lưu ý , với mỗi key query được sử dụng 2 lần thì nó sẽ có dạng array []
//     const respone = await ProductService.getAllCategory();
//     // Log API Check
//     return res.status(200).json(respone);
//   } catch (error) {
//     return res.status(404).json({
//       eMsg: error,
//     });
//   }
// };

module.exports = {
  createProduct,
  updateProduct,
  getProductDetail,
  deleteProduct,
  deleteAllProducts,
  getAllProduct,
  deleteManyProduct,
  searchProduct,
};

// File này nằm trong Controller / Folder điều khiển
// Controller chứa logic xử lý từng yêu cầu cụ thể, kiểm tra dữ liệu yêu cầu, và đưa ra phản hồi cho client.
// Controller nhận dữ liệu từ route, gọi service để thực hiện các thao tác cần thiết, và sau đó trả về kết quả.
// Giúp tách biệt giữa luồng điều khiển và xử lý logic phức tạp.

// req.body (sau khi có body-parse giúp trã giữ liệu về dạng json) => dữ liệu có sẳn ở dạng object
