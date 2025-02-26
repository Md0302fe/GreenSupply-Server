const JwtService = require("../services/JwtService");
const PurchaseOrderService = require("../services/PurchasedOrderService");
const fs = require("fs");
const path = require("path");

const createPurchaseOrder = async (req, res) => {
  try {
    const data = req.body;
    console.log("data => ", data);
    // Kiểm tra các trường bắt buộc
    if (!data) {
      return res.status(400).json({
        status: "ERROR",
        message: "Thông tin sản phẩm không hợp lệ",
      });
    }

    // Gọi service để lưu sản phẩm
    const newPurchaseOrder = await PurchaseOrderService.createPurchaseOrder(
      data
    );

    return res.status(201).json({
      status: "SUCCESS",
      PurchaseOrder: newPurchaseOrder,
    });
  } catch (error) {
    console.error("Error in createPurchaseOrder:", error);
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

// Phương Thức Update Thông Tin Của PurchaseOrder
const updatePurchaseOrder = async (req, res) => {
  try {
    // Lấy được id PurchaseOrder thông qua URL (/PurchaseOrder-user/:id) / get = params
    const PurchaseOrderId = req.params.id;
    const data = req.body;
    if (!PurchaseOrderId) {
      res.status(200).json({
        status: "ERROR",
        message: "The PurchaseOrder Id is required !",
      });
    }
    const respone = await PurchaseOrderService.updatePurchaseOrder(
      PurchaseOrderId,
      data
    );
    // Log API Check
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

const getPurchaseOrderDetail = async (req, res) => {
  try {
    const PurchaseOrderId = req.params.id;
    const response = await PurchaseOrderService.getPurchaseOrderDetail(
      PurchaseOrderId
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching PurchaseOrder detail:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPurchaseOrderDetail,
};



// Phương Thức Delele User
const deletePurchaseOrder = async (req, res) => {
  try {
    // Lấy ID từ request params
    const PurchaseOrderId = req.params.id;

    // Kiểm tra ID hợp lệ
    if (!PurchaseOrderId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Thiếu ID đơn hàng!",
      });
    }

    // Gọi Service để cập nhật is_deleted = true
    const response = await PurchaseOrderService.deletePurchaseOrder(PurchaseOrderId);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi xóa đơn hàng:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi trong quá trình xóa đơn hàng!",
      eMsg: error.message,
    });
  }
};


// Phương thức xóa tất cả sản phẩm
const deleteAllPurchaseOrders = async (req, res) => {
  try {
    const deleteAllPurchaseOrders =
      await PurchaseOrderService.deleteAllPurchaseOrders();
    return res.status(200).json({
      status: "SUCCESS",
      message: "All PurchaseOrders have been deleted successfully!",
      data: deleteAllPurchaseOrders, // Có thể trả về số sản phẩm đã xóa hoặc danh sách các sản phẩm bị xóa
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while deleting all PurchaseOrders.",
      eMsg: error.message,
    });
  }
};

// Phương Thức DELETE Many
const deleteManyPurchaseOrder = async (req, res) => {
  try {
    // Lấy được id người dùng thông qua URL (/update-user/:id) / get = params
    const ids = req.body;
    if (!ids) {
      res.status(200).json({
        status: "ERROR",
        message: "The PurchaseOrder ids is required !",
      });
    }

    const respone = await PurchaseOrderService.deleteManyPurchaseOrder(ids);

    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Get All PurchaseOrder
// const getAllPurchaseOrder = async (req, res) => {
//   try {
//     // Lưu ý , với mỗi key query được sử dụng 2 lần thì nó sẽ có dạng array []
//     const { limit, page, sort, filter } = req.query;

//     const respone = await PurchaseOrderService.getAllPurchaseOrder(
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

const getAllPurchaseOrder = async (req, res) => {
  try {
    // Gọi PurchaseOrderService để lấy danh sách sản phẩm
    const response = await PurchaseOrderService.getAllPurchaseOrder();
    
    // Trả về danh sách sản phẩm đã chỉnh sửa
    return res.status(200).json({
      status: "SUCCESS",
      data: response,
    });
  } catch (error) {
    console.error("Lỗi trong getAllPurchaseOrder:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Không thể tải dữ liệu sản phẩm!",
    });
  }
};

// Phương Thức Search PurchaseOrder
const searchPurchaseOrder = async (req, res) => {
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
    const PurchaseOrders = await PurchaseOrderService.searchPurchaseOrderByName(
      trimmedName
    );
    return res.status(200).json({
      status: "SUCCESS",
      PurchaseOrders,
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

//     const respone = await PurchaseOrderService.createCategory(req.body);
//     // Log ra API check ,
//     return res.status(200).json(respone);
//   } catch (error) {
//     return res.status(404).json({
//       eMsg: error,
//     });
//   }
// };

// Phương Thức Get All PurchaseOrder
// const getAllCategory = async (req, res) => {
//   try {
//     // Lưu ý , với mỗi key query được sử dụng 2 lần thì nó sẽ có dạng array []
//     const respone = await PurchaseOrderService.getAllCategory();
//     // Log API Check
//     return res.status(200).json(respone);
//   } catch (error) {
//     return res.status(404).json({
//       eMsg: error,
//     });
//   }
// };

module.exports = {
  createPurchaseOrder,
  updatePurchaseOrder,
  getPurchaseOrderDetail,
  deletePurchaseOrder,
  deleteAllPurchaseOrders,
  getAllPurchaseOrder,
  deleteManyPurchaseOrder,
  searchPurchaseOrder,
};

// File này nằm trong Controller / Folder điều khiển
// Controller chứa logic xử lý từng yêu cầu cụ thể, kiểm tra dữ liệu yêu cầu, và đưa ra phản hồi cho client.
// Controller nhận dữ liệu từ route, gọi service để thực hiện các thao tác cần thiết, và sau đó trả về kết quả.
// Giúp tách biệt giữa luồng điều khiển và xử lý logic phức tạp.

// req.body (sau khi có body-parse giúp trã giữ liệu về dạng json) => dữ liệu có sẳn ở dạng object
