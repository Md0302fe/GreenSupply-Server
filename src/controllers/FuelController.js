const FuelManagementService = require("../services/FuelManagementService");

const getAll = async (req, res) => {
  try {
    const filters = req.query;
    const response = await FuelManagementService.getAllFuel();
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
    const updatedFuel = await FuelManagementService.updateFuel(req.params.id, req.body);
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
    const canceledFuel = await FuelManagementService.cancelFuel(req.params.id);
    if (!canceledFuel) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhiên liệu!" });
    }
    res.json({ success: true, message: "Đã đánh dấu 'Đã xóa'!", data: canceledFuel });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi hủy!", error: error.message });
  }
};




const getDashboardSummary = async (req, res) => {
  try {
    const summary = await FuelManagementService.getDashboardSummary();
    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu!", error: error.message });
  }
};

const getFuelTypesOverview = async (req, res) => {
  try {
    const fuelTypes = await FuelManagementService.getFuelTypesOverview();
    return res.status(200).json(fuelTypes);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu!", error: error.message });
  }
};

const getFuelHistory = async (req, res) => {
  try {
    const history = await FuelManagementService.getFuelHistory();
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu!", error: error.message });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const alerts = await FuelManagementService.getLowStockAlerts();
    return res.status(200).json(alerts);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu!", error: error.message });
  }
};



module.exports = {
  getAll,
  updateFuel,
  cancelFuel, 
  getDashboardSummary,
  getFuelTypesOverview,
  getFuelHistory,
  getLowStockAlerts,
};
