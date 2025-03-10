const BatchHistoryService = require("../services/BatchHistoryService");

const getAllStorages = async (req, res) => {
  try {
    const response = await BatchHistoryService.getAllStorages();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách kho lưu trữ!",
      error: error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    const { formData } = req.body;
    if (!formData.material_export_id) {
      return res.status(400).json({
        status: "ERROR",
        message: "Id của đơn xuất kho không hợp lệ!",
      });
    }

    const response = await BatchHistoryService.create(formData);

    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in create RawMaterialBatch:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi trong quá trình tạo lô nguyên liệu!",
      eMsg: error.message,
    });
  }
};

const getAllHistory = async (req, res) => {
  try {
    const response = await BatchHistoryService.getAllHistory(req.query);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi trong getAll controller:", error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi server khi lấy danh sách lô nguyên liệu",
      error: error.message,
    });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await BatchHistoryService.getById(id);

    if (!batch) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lô nguyên liệu!" });
    }

    return res.status(200).json({ success: true, data: batch });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server!", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const updatedProductionRequest = await ProductRequestService.update(
      req.params.id,
      req.body
    );
    if (!updatedProductionRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhiên liệu!" });
    }
    res.json({
      success: true,
      message: "Cập nhật thành công!",
      data: updatedProductionRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật!",
      error: error.message,
    });
  }
};

const cancel = async (req, res) => {
  try {
    const canceledFuel = await ProductRequestService.cancel(req.params.id);
    if (!canceledFuel) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhiên liệu!" });
    }
    res.json({
      success: true,
      message: "Đã đánh dấu 'Đã xóa'!",
      data: canceledFuel,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi hủy!", error: error.message });
  }
};

module.exports = {
  getAllStorages,
  create,
  getAllHistory,
  getById,
  update,
  cancel,
};
