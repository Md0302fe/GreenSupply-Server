const RawMaterialBatch = require("../models/Raw_Material_Batch");
const FuelStorage = require("../models/Fuel_Storage");
const { default: mongoose } = require("mongoose");

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

  return `${prefix}${year}${month}${day}-${batchNumber}`;
};

const create = async (batchData) => {
  try {
    const newBatch = await RawMaterialBatch.create(batchData);
    console.log(" newBatch => ", newBatch)

    if(!newBatch){
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

const update = async (id, data) => {
  try {
    const updated = await RawMaterialBatch.findByIdAndUpdate(
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
};
