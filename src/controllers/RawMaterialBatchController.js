const RawMaterialBatchService = require("../services/RawMaterialBatchService");

const create = async (req, res) => {
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
    const response = await RawMaterialBatchService.create(req.body);
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


const cancel = async (req, res) => {
  try {
    const canceledFuel = await ProductRequestService.cancel(req.params.id);
    if (!canceledFuel) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhiên liệu!" });
    }
    res.json({ success: true, message: "Đã đánh dấu 'Đã xóa'!", data: canceledFuel });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi hủy!", error: error.message });
  }
};

module.exports = {
  create,
  getAll,
  update,
  cancel,
};
