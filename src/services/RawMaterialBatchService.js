const RawMaterialBatch = require("../models/Raw_Material_Batch");
const FuelStorage = require("../models/Fuel_Storage");
const FuelType = require("../models/Fuel_Types");
const mongoose = require("mongoose");

const getAllStorages = async () => {
  try {
    const storages = await FuelStorage.find({}, "_id name_storage");
    return {
      success: true,
      message: "Lấy danh sách kho lưu trữ thành công!",
      data: storages,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const generateBatchId = (prefix = "XMTH") => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Định dạng 2 số
  const day = String(today.getDate()).padStart(2, "0"); // Định dạng 2 số

  const batchNumber = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${prefix}${day}${month}${year}-${batchNumber}`;
};

const create = async (batchData) => {
  try {
    const newBatch = await RawMaterialBatch.create(batchData);
    console.log(" newBatch => ", newBatch);

    if (!newBatch) {
      return {
        success: false,
        message: "Tạo lô nguyên liệu thất bại!",
        batch: newBatch,
      };
    }
    return {
      success: true,
      message: "Tạo lô nguyên liệu thành công!",
      batch: newBatch,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAll = async (filters) => {
  try {
    const requests = await RawMaterialBatch.find()
      .populate({
        path: "fuel_type_id",
        populate: {
          path: "storage_id",
        },
      })
      .populate({
        path: "fuel_type_id",
        populate: {
          path: "fuel_type_id",
        },
      })
      .sort({ createdAt: -1 });

    return {
      success: true,
      status: "Lấy danh sách lô nguyên liệu thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getById = async (id) => {
  try {
    const batch = await RawMaterialBatch.findById(id).populate({
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
const getBatchByRequestId = async (id) => {
  try {
    const batches = await RawMaterialBatch.find({ production_request_id: id }).populate({
      path: "fuel_type_id",
      populate: [
        { path: "storage_id" },
        { path: "fuel_type_id" }, // <-- đặt tên này hơi trùng với chính field đang populate?
      ],
    });
    if (!batches || batches.length === 0) {
      throw new Error("Không tìm thấy lô nguyên liệu!");
    }

    return {
      success: true,
      status: "Lấy lô nguyên liệu thành công!",
      batches,
    };
  } catch (error) {
    console.error("🔥 Lỗi trong RawMaterialBatchService.getBatchByRequestId:", error);
    throw new Error(error.message);
  }
};


const update = async (id, data) => {
  try {
    // Kiểm tra xem fuel_type_id có hợp lệ không (nếu là ObjectId thì không cần kiểm tra)
    if (!mongoose.Types.ObjectId.isValid(data._id)) {
      throw new Error("Fuel type ID không hợp lệ!");
    }
    // Kiểm tra xem storage_id có hợp lệ không
    if (data.storage_id && !mongoose.Types.ObjectId.isValid(data.storage_id)) {
      throw new Error("Storage ID không hợp lệ!");
    }

    // Cập nhật lô nguyên liệu
    const updated = await RawMaterialBatch.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    ).populate({
      path: "fuel_type_id",
      populate: {
        path: "storage_id",
      },
    })
    .populate({
      path: "fuel_type_id",
      populate: {
        path: "fuel_type_id",
      },
    });

    if (!updated) {
      throw new Error("Không tìm thấy lô nguyên liệu!");
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
    const canceled = await RawMaterialBatch.findByIdAndUpdate(
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
  getAllStorages,
  generateBatchId,
  create,
  getAll,
  getById,
  update,
  cancel,
  getBatchByRequestId
};
