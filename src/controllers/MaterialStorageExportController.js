const MaterialStorageExportService = require("../services/MaterialStorageExportService");

const create = async (req, res) => {
  try {
    const { production_request_id, batch_id, user_id, export_name, type_export, note } = req.body;
    
    if (!production_request_id || !batch_id || !user_id || !export_name) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ!",
      });
    }

    const storageExportData = {
      production_request_id,
      batch_id,
      user_id,
      export_name,
      type_export: type_export || "Đơn sản xuất",
      note: note || "",
    };

    const response = await MaterialStorageExportService.create(storageExportData);
    return res.status(response.success ? 201 : 400).json(response);

  } catch (error) {
    console.error("Lỗi khi tạo đơn xuất kho:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn xuất kho",
      error: error.message,
    });
  }
};

module.exports = {
  create,
};
