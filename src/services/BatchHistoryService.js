const BatchHistory = require("../models/Batch_Export_History.js");
const FuelStorage = require("../models/Fuel_Storage");
const { default: mongoose } = require("mongoose");

const create = async (formData) => {
  try {
    const { material_export_id } = formData;
    const newBatchHistory = { material_export_id };

    const batchCreated = new BatchHistory.create(newBatchHistory);

    if (!batchCreated) {
      return {
        success: false,
        message: "Lưu lịch sử đơn xuất lô thất bại !",
      };
    }
    return {
      success: true,
      message: "Lưu lịch sử đơn xuất lô thành công !",
      batch: batchCreated,
    };
  } catch (error) {
    console.log("Đã có lỗi sảy ra trong quá trình lưu lịch sử => ", error);
    return {
      success: false,
      message: "Lưu lịch sử đơn xuất lô thất bại !",
    };
  }
};

const getAllHistory = async (filters) => {
  try {
    const requests = await BatchHistory.find()
      .populate({
        path: "material_export_id",
        populate: [
          { path: "production_request_id" },
          { path: "batch_id" },
          { path: "user_id" },
        ],
      })
      .sort({ createdAt: -1 });

    return {
      success: true,
      status: "Get lịch sử xuất lô thành công",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getById = async (id) => {
  try {
    const batch = await BatchHistory.findById(id).populate({
      path: "fuel_type_id",
      populate: [{ path: "storage_id" }, { path: "fuel_type_id" }],
    });

    if (!batch) {
      throw new Error("Không tìm thấy lô nguyên liệu!");
    }

    return {
      success: true,
      status: "Lấy chi tiết lô nguyên liệu thành công!",
      batch,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const update = async (id, data) => {
  try {
    const updated = await BatchHistory.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      throw new Error("Không tìm thấy nhiên liệu!");
    }

    return {
      success: true,
      message: "Cập nhật thành công!",
      data: updated,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const cancel = async (id) => {
  try {
    const canceled = await BatchHistory.findByIdAndUpdate(
      id,
      { is_deleted: true, updatedAt: new Date() },
      { new: true }
    );

    if (!canceled) {
      throw new Error("Không tìm thấy nhiên liệu!");
    }

    return {
      success: true,
      message: "Đã đánh dấu nhiên liệu là 'Đã xóa'!",
      data: canceled,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getAllHistory,
  create,
  getById,
  update,
  cancel,
};
