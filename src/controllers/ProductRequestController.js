const ProductRequestService = require("../services/ProductRequestService");

const createProductRequest = async (req, res) => {
  try {
    const {
      request_name,
      material,
      product_quantity,
      material_quantity,
      production_date,
      end_date,
      priority,
      request_type,
      note } = req.body;
      console.log(request_name)
    if (!request_name || !material || !product_quantity || !production_date || !end_date || !priority) {
      return res.status(400).json({
        status: "ERROR",
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }
    const response = await ProductRequestService.createProductRequest(req.body);
    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in createProduct:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi trong quá trình tạo sản phẩm",
      eMsg: error.message,
    });
  }
};
const getAll = async (req, res) => {
  try {
    const filters = req.query;
    const response = await ProductRequestService.getAll(filters);
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
    const response = await ProductRequestService.getAllProcessing(filters);
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
    const updatedProductionRequest = await ProductRequestService.update(req.params.id, req.body);
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
    const deletedProductionRequest = await ProductRequestService.deleteById(req.params.id);
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
    const changeStatus = await ProductRequestService.changeStatus(req.params.id);
    if (!changeStatus) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhiên liệu!" });
    }
    res.json({ success: true, message: "Đã Duyệt", data: changeStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi hủy!", error: error.message });
  }
};

const getProductionChartData = async (req, res) => {
  try {
    const response = await ProductRequestService.getProductionChartData();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi trong getProductionChartData:", error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi khi lấy dữ liệu biểu đồ!",
      error: error.message
    });
  }
};

module.exports = {
  createProductRequest,
  getAll,
  getAllProcessing,
  update,
  deleteById,
  changeStatus,
  getProductionChartData,
};
