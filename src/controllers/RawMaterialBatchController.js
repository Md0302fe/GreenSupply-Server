const RawMaterialBatchService = require("../services/RawMaterialBatchService");

const getAllStorages = async (req, res) => {
  try {
    const response = await RawMaterialBatchService.getAllStorages();
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
    console.log("formData => ", formData);
    if (
      !formData.batch_name ||
      !formData.batch_id ||
      !formData.fuel_type_id ||
      !formData.production_request_id ||
      !formData.storage_id
    ) {
      return res.status(400).json({
        status: "ERROR",
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
      });
    }
    console.log("formData => ", formData);
    const response = await RawMaterialBatchService.create(formData);

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

const getAll = async (req, res) => {
  try {
    const response = await RawMaterialBatchService.getAll(req.query);
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
    const batch = await RawMaterialBatchService.getById(id);

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
const getBatchByRequestId = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await RawMaterialBatchService.getBatchByRequestId(id);

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
    const { formData } = req.body;

    // Gọi service để cập nhật lô nguyên liệu
    const updatedBatch = await RawMaterialBatchService.update(
      req.params.id,
      formData
    );

    if (!updatedBatch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lô nguyên liệu!",
      });
    }

    // Trả về kết quả thành công
    res.json({
      success: true,
      message: "Cập nhật thành công!",
      data: updatedBatch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật!",
      error: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const response = await RawMaterialBatchService.updateStatus(id, status);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi server khi cập nhật trạng thái!",
      error: error.message,
    });
  }
};


// const cancel = async (req, res) => {
//   try {
//     const canceledFuel = await ProductRequestService.cancel(req.params.id);
//     if (!canceledFuel) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Không tìm thấy nhiên liệu!" });
//     }
//     res.json({
//       success: true,
//       message: "Đã đánh dấu 'Đã xóa'!",
//       data: canceledFuel,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Lỗi khi hủy!", error: error.message });
//   }
// };

module.exports = {
  getAllStorages,
  create,
  getAll,
  getById,
  update,
  // cancel,
  getBatchByRequestId,
  updateStatus,
};
