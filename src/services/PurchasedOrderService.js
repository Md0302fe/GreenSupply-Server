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

    console.log("newPurchaseOrder => ", newPurchaseOrder);

    await newPurchaseOrder.save();
    return {
      status: "Create New PurchaseOrder Is Successfully!",
      PurchaseOrder: newPurchaseOrder,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Cập nhật sản phẩm
const updatePurchaseOrder = async (id, data) => {
  try {
    const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
    if (!updatedPurchaseOrder) {
      throw new Error("PurchaseOrder not found");
    }
    return {
      status: "Update PurchaseOrder Is Successfully!",
      PurchaseOrder: updatedPurchaseOrder,
    };
  } catch (error) {
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
    const PurchaseOrders = await PurchaseOrder.find()
    .sort({priority: -1, start_received: -1})

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
    const deletedPurchaseOrder = await PurchaseOrder.findByIdAndDelete(id);
    if (!deletedPurchaseOrder) {
      throw new Error("PurchaseOrder not found");
    }
    return {
      status: "Delete PurchaseOrder Is Successfully!",
      PurchaseOrder: deletedPurchaseOrder,
    };
  } catch (error) {
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
};
