const ProductionProcessingService = require("../services/ProductionProcessingService");

const create = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: "ERROR",
        message: "Thiếu dữ liệu gửi lên từ frontend.",
      });
    }

    const {
      production_request_id,
      start_time,
      end_time,
      note
    } = req.body;

    // Kiểm tra các trường bắt buộc
    const requiredFields = {
      production_request_id,
      start_time,
      end_time,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "ERROR",
        message: `Thiếu trường bắt buộc: ${missingFields.join(", ")}`,
      });
    }

    const response = await ProductionProcessingService.create(req.body);

    return res.status(200).json({
      success: true,
      message: "Tạo quy trình sản xuất thành công",
      data: response,
    });
  } catch (error) {
    console.error("Lỗi tạo quy trình sản xuất:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi trong quá trình tạo quy trình sản xuất",
      error: error.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const filters = req.query;
    const response = await ProductionProcessingService.getAll(filters);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi trong getAll controller:", error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi server khi lấy danh sách nhiên liệu",
      error: error.message,
    });
  }
};

const getAllProcessing = async (req, res) => {
  try {
    const filters = req.query;
    const response = await ProductionProcessingService.getAllProcessing(filters);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi trong getAll controller:", error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi server khi lấy danh sách nhiên liệu",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const updatedProductionRequest = await ProductionProcessingService.update(req.params.id, req.body);
    if (!updatedProductionRequest) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhiên liệu!" });
    }
    res.json({ success: true, message: "Cập nhật thành công!", data: updatedProductionRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật!", error: error.message });
  }
};


const deleteById = async (req, res) => {
  try {
    const deletedProductionRequest = await ProductionProcessingService.deleteById(req.params.id);
    if (!deletedProductionRequest) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhiên liệu!" });
    }
    res.json({ success: true, message: "Đã xóa", data: deletedProductionRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi hủy!", error: error.message });
  }
};
const changeStatus = async (req, res) => {
  try {
    const changeStatus = await ProductionProcessingService.changeStatus(req.params.id);
    if (!changeStatus) {
      return res.status(404).json({ success: false, message: "Không tìm thấy!" });
    }
    res.json({ success: true, message: "Đã Duyệt", data: changeStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi hủy!", error: error.message });
  }
};



///////////////////Dashboard processing

const getDashboardprocess = async (req, res) => {
  try {
    const stats = await ProductionProcessingService.getDashboardprocess();
    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu dashboard thành công",
      data: stats,
    });
  } catch (error) {
    console.error("Lỗi dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu dashboard",
      error: error.message,
    });
  }
};


module.exports = {
  create,
  getAll,
  getAllProcessing,
  update,
  deleteById,
  changeStatus,
  getDashboardprocess,
};
