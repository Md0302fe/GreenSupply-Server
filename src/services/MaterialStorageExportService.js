const MaterialStorageExport = require("../models/Material_Storage_Export");
const ProductionRequest = require("../models/Production_Request");
const RawMaterialBatch = require("../models/Raw_Material_Batch");
const User = require("../models/UserModel");
const mongoose = require("mongoose");

const create = async (storageExport) => {
  try {
    const {
      production_request_id,
      batch_id,
      user_id,
      export_name,
      type_export,
      note,
    } = storageExport;

    if (!mongoose.Types.ObjectId.isValid(production_request_id) || 
        !mongoose.Types.ObjectId.isValid(batch_id) || 
        !mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error("ID không hợp lệ.");
    }

    // Kiểm tra tồn tại của production_request, batch, user
    const existingProductionRequest = await ProductionRequest.findById(
      production_request_id
    );
    if (!existingProductionRequest) {
      throw new Error(
        `Không tìm thấy đơn sản xuất với ID: ${production_request_id}`
      );
    }

    const existingBatch = await RawMaterialBatch.findById(batch_id);
    if (!existingBatch) {
      throw new Error(`Không tìm thấy lô nguyên liệu với ID: ${batch_id}`);
    }

    const existingUser = await User.findById(user_id);
    if (!existingUser) {
      throw new Error(`Không tìm thấy người dùng với ID: ${user_id}`);
    }

    // Kiểm tra tính hợp lệ của export_name (chỉ cho phép chữ cái, số và khoảng trắng)
    if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/.test(export_name)) {
      throw new Error(
        "Tên xuất kho không hợp lệ! Chỉ được chứa chữ cái, số và khoảng trắng."
      );
    }

    const newStorageExport = new MaterialStorageExport({
      production_request_id,
      batch_id,
      user_id,
      export_name,
      type_export: type_export || "Đơn sản xuất",
      note: note || "",
      status: "Chờ duyệt",
      is_deleted: false,
    });

    await newStorageExport.save();

    const populatedExport = await MaterialStorageExport.findById(newStorageExport._id)
      .populate({
        path: "production_request_id",
        populate: { path: "material" },
      })
      .populate("batch_id")
      .populate("user_id");

    return {
      success: true,
      message: "Tạo đơn xuất kho thành công!",
      export: populatedExport,
    };
  } catch (error) {
    console.error("Lỗi khi tạo đơn xuất kho:", error);
    return {
      success: false,
      message: error.message || "Lỗi khi tạo đơn xuất kho",
    };
  }
};

module.exports = {
  create,
};
