const PurchaseOrder = require("../models/Admin_Fuel_Entry");
// const CategoryModel = require("../models/CategoryModel");

// Tạo sản phẩm mới   
const createPurchaseOrder = async (PurchaseOrderData) => {
  try {
    const priorityMapping = {
      "Cao": 1,
      "Trung bình": 2,
      "Thấp": 3,
    };
    PurchaseOrderData.priority =
      priorityMapping[PurchaseOrderData.priority] || 2;

    const newPurchaseOrder = new PurchaseOrder(PurchaseOrderData);

    if(newPurchaseOrder){
      await newPurchaseOrder.save();
      return {
        status: "Create New PurchaseOrder Is Successfully!",
        PurchaseOrder: newPurchaseOrder,
      };
    }else{
      return {
        status: "Create New PurchaseOrder Is Fail!",
        PurchaseOrder: newPurchaseOrder,
      };
    }
  } catch (error) {
    console.log("Đã có lỗi xảy ra trong quá trình tạo purchased order => ", error)
    throw new Error(error.message);
  }
};

// Cập nhật sản phẩm
// const updatePurchaseOrder = async (id, data) => {
//   try {
//     const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
//       id,
//       data,
//       { new: true } // Đảm bảo trả về giá trị sau khi cập nhật
//     );
//     if (!updatedPurchaseOrder) {
//       throw new Error("PurchaseOrder not found");
//     }
//     return {
//       status: "Update PurchaseOrder Is Successfully!",
//       PurchaseOrder: updatedPurchaseOrder, // Kiểm tra xem priority có tồn tại trong object này không
//     };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

const updatePurchaseOrder = async (id, data) => {
  try {
    const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      data,
      { new: true } // Đảm bảo lấy lại dữ liệu sau khi cập nhật
    );

    if (!updatedPurchaseOrder) {
      throw new Error("PurchaseOrder không tìm thấy");
    }

    console.log("Dữ liệu sau khi cập nhật:", updatedPurchaseOrder);

    return {
      status: "Cập nhật PurchaseOrder thành công!",
      PurchaseOrder: updatedPurchaseOrder,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật PurchaseOrder:", error);
    throw new Error(error.message);
  }
};

// Accept
const acceptPurchaseOrder = async (id, data) => {
  try {
    const newData = {...data, status : "Đang xử lý"};
    console.log("newData => ", newData);
    const acceptedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      newData,
      { new: true } // Đảm bảo lấy lại dữ liệu sau khi cập nhật
    );

    if (!acceptedPurchaseOrder) {
      throw new Error("PurchaseOrder không tìm thấy");
    }

    console.log("Dữ liệu sau khi cập nhật:", acceptedPurchaseOrder);

    return {
      status: "Cập nhật PurchaseOrder thành công!",
      PurchaseOrder: acceptedPurchaseOrder,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật PurchaseOrder:", error);
    throw new Error(error.message);
  }
};



// Lấy chi tiết sản phẩm
const getPurchaseOrderDetail = async (id) => {
  try {
    const PurchaseOrderDetail = await PurchaseOrder.findById(id);
    if (!PurchaseOrderDetail) {
      throw new Error("PurchaseOrder not found");
    }
    return {
      status: "Get PurchaseOrder Details Is Successfully!",
      PurchaseOrderDetail,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy tất cả sản phẩm
const getAllPurchaseOrder = async () => {
  try {
    const PurchaseOrders = await PurchaseOrder.find({is_deleted: false})
    .sort({priority: 1})
    

    return {
      status: "OK",
      message: "Get All PurchaseOrders Is Successfully!",
      data: PurchaseOrders,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};



// Xóa sản phẩm
const deletePurchaseOrder = async (id) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      return { status: "ERROR", message: "Đơn hàng không tồn tại!" };
    }

    if (purchaseOrder.is_deleted) {
      return { status: "ERROR", message: "Đơn hàng này đã bị hủy trước đó!" };
    }

    // Chỉ cập nhật is_deleted, không thay đổi status
    purchaseOrder.is_deleted = true;
    await purchaseOrder.save();

    return { status: "SUCCESS", message: "Đơn hàng đã được hủy thành công!", PurchaseOrder: purchaseOrder };
  } catch (error) {
    console.error("Lỗi khi xóa đơn hàng:", error);
    throw new Error(error.message);
  }
};




// Xóa tất cả sản phẩm
const deleteAllPurchaseOrders = async () => {
  try {
    const result = await PurchaseOrder.deleteMany({});
    return {
      status: "Delete All PurchaseOrders Is Successfully!",
      deletedCount: result.deletedCount, // Trả về số sản phẩm đã bị xóa
    };
  } catch (error) {
    throw new Error("Failed to delete all PurchaseOrders: " + error.message);
  }
};

// Xóa nhiều sản phẩm
const deleteManyPurchaseOrder = async (ids) => {
  try {
    const deletedPurchaseOrders = await PurchaseOrder.deleteMany({
      _id: { $in: ids },
    });
    return {
      status: "Delete Many PurchaseOrders Is Successfully!",
      deletedCount: deletedPurchaseOrders.deletedCount,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const searchPurchaseOrderByName = async (name) => {
  try {
    const regex = new RegExp(name, "i"); // "i" để không phân biệt hoa thường
    const PurchaseOrders = await PurchaseOrder.find({ name: regex }); // Sử dụng regex
    return PurchaseOrders;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createPurchaseOrder,
  updatePurchaseOrder,
  getPurchaseOrderDetail,
  getAllPurchaseOrder,
  deletePurchaseOrder,
  deleteAllPurchaseOrders,
  deleteManyPurchaseOrder,
  searchPurchaseOrderByName,
  acceptPurchaseOrder,
};
