const MaterialStorageExport = require("../models/Storage_Export");
const ProductionRequest = require("../models/Production_Request");
const RawMaterialBatch = require("../models/Raw_Material_Batch");
const batchHistory = require("../models/Batch_Export_History")
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

const getAll = async (search = "", status = "", sortOrder = "desc") => {
  try {
    let query = { is_deleted: false };

    if (status) {
      query.status = status;  
    }

    const sort = sortOrder === "asc" ? { createdAt: 1 } : { createdAt: -1 };

    let exports = await MaterialStorageExport.find(query)
      .populate({
        path: "production_request_id",
        populate: { path: "material" },
      })
      .populate("batch_id")
      .populate("user_id")
      .sort(sort);

    if (search) {
      const searchLower = search.toLowerCase();
      exports = exports.filter((exp) => {
        const exportName = exp.export_name?.toLowerCase() || "";
        const requestName = exp.production_request_id?.request_name?.toLowerCase() || "";
        const batchName = exp.batch_id?.batch_name?.toLowerCase() || "";
        const creatorName = exp.user_id?.full_name?.toLowerCase() || "";

        return (
          exportName.includes(searchLower) ||
          requestName.includes(searchLower) ||
          batchName.includes(searchLower) ||
          creatorName.includes(searchLower)
        );
      });
    }

    return { success: true, exports };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn xuất kho:", error);
    return {
      success: false,
      message: "Lỗi khi lấy danh sách đơn xuất kho",
    };
  }
};

const getDetails = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ.");
    }

    const storageExport = await MaterialStorageExport.findById(id)
      .populate({
        path: "production_request_id",
        populate: { path: "material" }, 
      })
      .populate("batch_id") 
      .populate("user_id"); 

    if (!storageExport) {
      return { success: false, message: "Không tìm thấy đơn xuất kho." };
    }

    return { success: true, export: storageExport };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn xuất kho:", error);
    return { success: false, message: "Lỗi khi lấy chi tiết đơn xuất kho" };
  }
};

// Accept Storage Export
const AcceptStorageExport = async (storage_export_id) => {
  try {
    const storageExportUpdate = await MaterialStorageExport.findByIdAndUpdate(
      storage_export_id,
      { status: "Hoàn thành" },
      { new: true }
    );
    
    if (!storageExportUpdate) {
      return { success: false, message: "Cập nhật đơn thất bại" };
    }
    
    // Tạo Lịch Sử Xuất Lô Khi Cập Nhật Đơn Thành Công
    const batchHistory = await createNewBatchStorageExport(storage_export_id);
    if(batchHistory){
      return { success: true, message: "Cập nhật đơn thành công" };
    }else{
      return { success: false, message: "Cập nhật đơn thất bại" };
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra trong quá trình cập nhật đơn xuất kho",
      error: error.message,
    });
  }
};

const createNewBatchStorageExport = async (material_export_id) => {
  try {
    const objectId = new mongoose.Types.ObjectId(material_export_id); // ép về ObjectId
    const record = await batchHistory.create({
      material_export_id: objectId,
    });

    return !!record; // trả về true nếu tạo thành công
  } catch (error) {
    console.error("Lỗi tạo batch export history:", error);
    return false;
  }
};

// Reject Storage Export
const RejectStorageExport = async (storage_export_id) => {
  try {
    const deleted = await MaterialStorageExport.findByIdAndDelete(
      storage_export_id
    );

    if (!deleted) {
      return { success: false, message: "Xóa đơn thất bại"};
    }

    return { success: true, message: "Xóa đơn thành công" };
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Xóa đơn xuất lô thất bại",
      error: error.message,
    });
  }
};

// Dashboard
const getTotalMaterialStorageExports = async () => {
  try {
    // Lấy tổng số đơn xuất kho
    const totalExports = await MaterialStorageExport.countDocuments({ is_deleted: false });

    // Lấy ngày sớm nhất và muộn nhất từ database
    const startDateRecord = await MaterialStorageExport.findOne({ is_deleted: false }).sort({ createdAt: 1 }).select('createdAt');
    const endDateRecord = await MaterialStorageExport.findOne({ is_deleted: false }).sort({ createdAt: -1 }).select('createdAt');
    
    if (!startDateRecord || !endDateRecord) {
      throw new Error("Không có dữ liệu xuất kho");
    }

    const startDate = startDateRecord.createdAt;
    const endDate = endDateRecord.createdAt;

    // Định dạng lại ngày theo chuỗi
    const startFormatted = `${new Date(startDate).getDate()} tháng ${new Date(startDate).getMonth() + 1}`;
    const endFormatted = `${new Date(endDate).getDate()} tháng ${new Date(endDate).getMonth() + 1}`;

    const dateRange = `Từ ${startFormatted} - ${endFormatted}`;

    // Trả về cả tổng số đơn và khoảng thời gian
    return { totalExports, dateRange };
  } catch (error) {
    throw new Error("Lỗi khi lấy tổng số đơn xuất kho và khoảng thời gian: " + error.message);
  }
};

const getStockExportByDate = async () => {
  try {
    const result = await MaterialStorageExport.aggregate([
      {
        $match: { is_deleted: false } // Lọc các đơn xuất kho hợp lệ
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
          totalExports: { $sum: 1 }, 
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return result;
  } catch (error) {
    throw new Error("Lỗi khi lấy dữ liệu xuất kho theo ngày: " + error.message);
  }
};

const getStockExportCompletedByDate = async () => {
  try {
    const result = await MaterialStorageExport.aggregate([
      {
        $match: {
          is_deleted: false,
          status: "Hoàn thành",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
          totalExports: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return result;
  } catch (error) {
    throw new Error("Lỗi khi lấy dữ liệu đơn xuất kho đã hoàn thành theo ngày: " + error.message);
  }
};

module.exports = {
  create,
  getAll,
  getDetails,
  AcceptStorageExport,
  RejectStorageExport,
  getTotalMaterialStorageExports,
  getStockExportByDate,
  getStockExportCompletedByDate,
};
