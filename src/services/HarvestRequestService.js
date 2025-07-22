const CollectionRequest = require("../models/Material_Collection_Request.js");
const UserModel = require("../models/UserModel.js");
const Notifications = require("../models/Notifications.js");
const socket = require("../socket.js");
const mongoose = require("mongoose");

const object_admin_role = new mongoose.Types.ObjectId(
  "67950da386a0a462d408c7b9"
);
const object_management_role = "";

const createHarvestRequest = async (data) => {
  try {
    const supplier = await UserModel.findById(data.supplier_id);
    if (!supplier) {
      throw new Error("Không tìm thấy Supplier với ID: " + data.supplier_id);
    }

    // Kiểm tra số lượng
    if (
      !data.quantity ||
      typeof data.quantity !== "number" ||
      data.quantity <= 0
    ) {
      throw new Error("Số lượng phải là số nguyên dương!");
    }

    // Kiểm tra giá
    if (!data.price || typeof data.price !== "number" || data.price <= 0) {
      throw new Error("Giá phải là số nguyên dương!");
    }

    // Tự động tính tổng giá
    data.total_price = data.price * data.quantity;

    if (!data.status) {
      data.status = "Chờ duyệt";
    }

    const newRequest = new CollectionRequest(data);
    await newRequest.save();

    // nếu tạo collection thành công --> taoj 1 record save to DB (notifications) và send noti to admin
    if (newRequest) {
      const io = socket.getIO();

      const newNoti = {
        user_id: new mongoose.Types.ObjectId(supplier?._id), // Người tạo đơn
        role_id: [object_admin_role], // send to
        title: "Đơn yêu cầu thu nguyên liệu",
        text_message: `${supplier?.full_name} vừa tạo đơn yêu cầu thu nguyên liệu mới`,
        type: ["request_supplier"],
        is_read: false,
        description: "Tạo đơn thu nguyên liệu mới thành công",
      };

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

    return {
      status: "Tạo yêu cầu thu hàng thành công!",
      harvestRequest: newRequest,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Cập nhật thông tin yêu cầu thu hàng (chỉ khi trạng thái là "Chờ duyệt")
const updateHarvestRequest = async (id, data) => {
  try {
    const existingRequest = await CollectionRequest.findById(id);

    if (!existingRequest) {
      throw new Error("Yêu cầu thu hàng không tồn tại!");
    }

    if (existingRequest.status !== "Chờ duyệt") {
      throw new Error("Không thể cập nhật đơn hàng đã được xử lý!");
    }

    if (data.address && data.address.trim() === "") {
      throw new Error("Địa chỉ nhận hàng không được để trống!");
    }

    if (typeof data.price === "number" && typeof data.quantity === "number") {
      data.total_price = data.price * data.quantity;
    }

    const updatedRequest = await CollectionRequest.findByIdAndUpdate(id, data, {
      new: true,
    });

    return {
      status: "Cập nhật yêu cầu thu hàng thành công!",
      harvestRequest: updatedRequest,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Hủy yêu cầu thu hàng (Chỉ khi trạng thái là "Chờ duyệt")
const cancelHarvestRequest = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID yêu cầu thu hàng không hợp lệ!");
    }

    const request = await CollectionRequest.findById(id);

    if (!request) {
      return {
        success: false,
        message: "Không tìm thấy yêu cầu thu hàng!",
      };
    }

    if (request.status !== "Chờ duyệt") {
      return {
        success: false,
        message: "Không thể hủy đơn hàng đã được xử lý!",
      };
    }

    request.status = "Đã huỷ";
    await request.save();

    return {
      success: true,
      message: "Hủy yêu cầu thu hàng thành công!",
      harvestRequest: request.toObject(), // Trả về dữ liệu sạch hơn
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || error,
    };
  }
};

const getHarvestRequestById = async (id) => {
  try {
    const request = await CollectionRequest.findById(id).populate(
      "supplier_id",
      "full_name email phone"
    );

    if (!request) {
      throw new Error(
        "Không tìm thấy yêu cầu thu hàng hoặc yêu cầu không tồn tại!"
      );
    }

    return {
      status: "Lấy chi tiết yêu cầu thu hàng thành công!",
      harvestRequest: request,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllHarvestRequests = async (user) => {
  try {
    const objectUserId = new mongoose.Types.ObjectId(user);

    const requests = await CollectionRequest.find({
      supplier_id: objectUserId,
      is_deleted: false,
    })
      .populate("supplier_id", "full_name email phone")
      .sort({ createdAt: -1 });

    const updatedRequests = requests.map((request) => {
      request.total_price = request.quantity * request.price;
      return request;
    });

    return {
      status: "Lấy danh sách yêu cầu thu hàng thành công!",
      requests: updatedRequests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getHarvestRequestHistories = async (user) => {
  try {
    // cast id to objectId before compare with data in mgdb
    const objectUserId = new mongoose.Types.ObjectId(user);

    const requests = await CollectionRequest.find({
      supplier_id: objectUserId,
      is_deleted: false,
      status: "Hoàn Thành",
    })
      .populate("supplier_id", "full_name email phone")
      .sort({ createdAt: -1 });

    // Manually calculate the total_price for each request
    const updatedRequests = requests.map((request) => {
      request.total_price = request.quantity * request.price;
      return request;
    });

    return {
      status: "Get List Harvest Request Histories Success !",
      requests: updatedRequests,
    };
  } catch (error) {
    console.log("Get List Harvest Request Histories Failed ! ", error);
    return {
      status: "Get List Harvest Request Histories Failed !",
      requests: updatedRequests,
    };
  }
};

module.exports = {
  createHarvestRequest,
  updateHarvestRequest,
  cancelHarvestRequest,
  getHarvestRequestById,
  getAllHarvestRequests,
  getHarvestRequestHistories,
};
