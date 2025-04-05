const FuelRequest = require("../models/Fuel_Request.js");
const Supplier = require("../models/Supplier.js");
const UserModel = require("../models/UserModel.js");
const mongoose = require("mongoose");

const createHarvestRequest = async (data) => {
  try {
    const existingSupplier = await UserModel.findById(data.supplier_id);
    if (!existingSupplier) {
      throw new Error("Không tìm thấy Supplier với ID: " + data.supplier_id);
    }

    // Kiểm tra Tên yêu cầu
    if (
      !data.fuel_name ||
      !/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/.test(data.fuel_name)
    ) {
      throw new Error(
        "Tên yêu cầu không hợp lệ! Chỉ được chứa chữ cái, số và khoảng trắng."
      );
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

    // Kiểm tra địa chỉ
    if (
      !data.address ||
      !/^[a-zA-Z0-9\s\u00C0-\u1EF9,.-]+$/.test(data.address)
    ) {
      throw new Error("Địa chỉ không hợp lệ!");
    }

    // Tự động tính tổng giá
    data.total_price = data.price * data.quantity;

    if (!data.status) {
      data.status = "Chờ duyệt";
    }

    const newRequest = new FuelRequest(data);
    await newRequest.save();

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
    const existingRequest = await FuelRequest.findById(id);

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

    const updatedRequest = await FuelRequest.findByIdAndUpdate(id, data, {
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

    const request = await FuelRequest.findById(id);

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
    const request = await FuelRequest.findById(id).populate(
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

const getAllHarvestRequests = async () => {
  try {
    // No filters, just fetch all the requests
    const requests = await FuelRequest.find({ is_deleted: false })
      .populate("supplier_id", "full_name email phone")
      .sort({ createdAt: -1 });

    // Manually calculate the total_price for each request
    const updatedRequests = requests.map(request => {
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



module.exports = {
  createHarvestRequest,
  updateHarvestRequest,
  cancelHarvestRequest,
  getHarvestRequestById,
  getAllHarvestRequests,
};
