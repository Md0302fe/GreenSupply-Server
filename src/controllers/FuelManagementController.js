const Material = require("../services/MaterialService");

const getAll = async (req, res) => {
  try {
    const filters = req.query;
    const response = await Material.getAllFuel(filters);
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

const updateFuel = async (req, res) => {
  try {
    const updatedFuel = await Material.updateFuel(req.params.id, req.body);
    if (!updatedFuel) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhiên liệu!" });
    }
    res.json({ success: true, message: "Cập nhật thành công!", data: updatedFuel });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật!", error: error.message });
  }
};


const cancelFuel = async (req, res) => {
  try {
    const canceledFuel = await Material.cancelFuel(req.params.id);
    if (!canceledFuel) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhiên liệu!" });
    }
    res.json({ success: true, message: "Đã đánh dấu 'Đã xóa'!", data: canceledFuel });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi hủy!", error: error.message });
  }
};

module.exports = {
  getAll,
  updateFuel,
  cancelFuel, 
};
