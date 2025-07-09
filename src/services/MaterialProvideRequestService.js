const mongoose = require("mongoose");
const PurchaseMaterialPlan = require("../models/Purchase_Material_Plan");
const Material_Provide_Request = require("../models/Material_Provide_Request");

const UserModel = require("../models/UserModel.js");
const Notifications = require("../models/Notifications.js");
const socket = require("../socket.js");

const object_admin_role = new mongoose.Types.ObjectId(
  "67950da386a0a462d408c7b9"
);
const object_management_role = "";

const createFuelSupplyRequest = async (data) => {
  try {
    // Lấy đơn yêu cầu từ Admin
    const supplier = await UserModel.findById(data.supplier_id);

    const adminRequest = await PurchaseMaterialPlan.findById(data.request_id);
    if (!adminRequest) {
      throw new Error(
        "Không tìm thấy yêu cầu nhập hàng với ID: " + data.request_id
      );
    }
    // Tạo đơn cung cấp nhiên liệu
    const newSupplyRequest = await Material_Provide_Request.create({
      supplier_id: data.supplier_id,
      request_id: data.request_id,
      fuel_name: data.fuel_name,
      price: data.price,
      total_price: data.total_price,
      quantity: data.quantity,
      quality: data.quality,
      address: data.user_address,
      status: "Chờ duyệt",
      note: data.note || "",
      fuel_type: data.fuel_type || "",
    });

    console.log("newSupplyRequest => ", newSupplyRequest)

    if (newSupplyRequest) {
      const io = socket.getIO();

      const newNoti = {
        user_id: new mongoose.Types.ObjectId(data.supplier_id), // Người tạo đơn
        role_id: [object_admin_role], // send to
        title: "Đơn cung cấp nguyên liệu",
        text_message: `${supplier?.full_name} vừa tạo đơn cung cấp nguyên liệu mới`,
        type: ["request_supplier"],
        is_read: false,
        description: "Tạo đơn cung cấp liệu mới thành công",
      };

      console.log("newNoti =>? ", newNoti)

      const newNotification = await Notifications.create(newNoti);

      if (!newNotification) {
        return {
          status: 400,
          success: false,
          message: "Tạo thông báo thất bại",
        };
      }
      io.emit("pushNotification", {
        ...newNotification.toObject(),
        timestamp: newNotification.createdAt,
      });
    }

    // Cập nhật số lượng còn lại của đơn yêu cầu
    // const newQuantity = adminRequest.quantity_remain - data.quantity;
    // const newStatus = newQuantity === 0 ? "Đã hoàn thành" : adminRequest.status;

    // await PurchaseMaterialPlan.findByIdAndUpdate(
    //   data.request_id,
    //   { quantity_remain: newQuantity, status: newStatus }, // Cập nhật quantity & status
    //   { new: true } // Trả về dữ liệu đã cập nhật
    // );

    return {
      success: true,
      message: "Yêu cầu cung cấp hàng đã được tạo thành công!",
      supplyRequest: newSupplyRequest,
    };
  } catch (error) {
    return {
      success: false,
      message: "Lỗi khi tạo yêu cầu cung cấp hàng",
      error: error.message,
    };
  }
};

const getAllFuelSupplyRequest = async (user) => {
  try {
    const objectUserId = new mongoose.Types.ObjectId(user);
    // Base query: Only include non-deleted records
    // let query = { is_deleted: false };

    // Fetch all fuel supply requests, populated with supplier data, and sorted by createdAt
    // const requests = await Material_Provide_Request.find(query)
    //   .populate("supplier_id", "full_name email phone")
    //   .sort({ createdAt: -1 });

    const requests = await Material_Provide_Request.find({
      supplier_id: objectUserId,
      is_deleted: false,
    })
      .populate("supplier_id", "full_name email phone")
      .sort({ createdAt: -1 });

    return {
      status: "Lấy danh sách yêu cầu cung cấp thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Hủy yêu cầu thu hàng (Chỉ khi trạng thái là "Chờ duyệt")
const deleteFuelSupplyRequest = async (id) => {
  try {
    const request = await Material_Provide_Request.findByIdAndDelete(id);

    return {
      success: true,
      message: "Xóa đơn cung cấp thành công!",
      harvestRequest: request.toObject(), // Trả về dữ liệu sạch hơn
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || error,
    };
  }
};

// Cập nhật thông tin yêu cầu thu hàng (chỉ khi trạng thái là "Chờ duyệt")
const updateFuelSupplyRequest = async (id, data) => {
  try {
    const existingRequest = await Material_Provide_Request.findById(id);

    if (!existingRequest) {
      throw new Error("Yêu cầu thu hàng không tồn tại!");
    }

    if (existingRequest.status !== "Chờ duyệt") {
      throw new Error("Không thể cập nhật đơn hàng đã được xử lý!");
    }

    if (data.address && data.address.trim() === "") {
      throw new Error("Địa chỉ nhận hàng không được để trống!");
    }

    const quantity = parseFloat(data.quantity);
    const price = parseFloat(data.price);

    if (Number.isNaN(quantity) || quantity <= 0) {
      throw new Error("Số lượng phải là số hợp lệ và lớn hơn 0!");
    }

    if (Number.isNaN(price) || price <= 0) {
      throw new Error("Giá phải là số hợp lệ và lớn hơn 0!");
    }

    data.total_price = quantity * price;

    const updatedRequest = await Material_Provide_Request.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );

    return {
      status: "Cập nhật yêu cầu thu hàng thành công!",
      harvestRequest: updatedRequest,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getById = async (id) => {
  try {
    // Tìm kiếm đơn yêu cầu theo ID
    const request = await Material_Provide_Request.findById(id).populate(
      "supplier_id",
      "full_name email phone"
    );

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu cung cấp với ID: " + id);
    }

    return {
      success: true,
      message: "Lấy chi tiết yêu cầu cung cấp thành công!",
      request,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

module.exports = {
  createFuelSupplyRequest,
  getAllFuelSupplyRequest,
  deleteFuelSupplyRequest,
  updateFuelSupplyRequest,
  getById,
};
