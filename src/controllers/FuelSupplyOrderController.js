const FuelSupplyOrderService = require("../services/FuelSupplyOrderService");

const createFuelSupplyRequest = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({
        message: "Thiếu dữ liệu bắt buộc! Vui lòng kiểm tra."
      });
    }

    const response = await FuelSupplyOrderService.createFuelSupplyRequest(req.body);

    return res.status(201).json(response);

  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu cung cấp hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo yêu cầu cung cấp hàng",
      error: error.message
    });
  }
};

const getAllFuelSupplyRequest = async (req, res) => {
  try {
    const response = await FuelSupplyOrderService.getAllFuelSupplyRequest();

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

// API hủy yêu cầu thu hàng
const deleteFuelSupplyRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    if (!requestId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Yêu cầu thu hàng ID là bắt buộc!",
      });
    }

    const response = await FuelSupplyOrderService.deleteFuelSupplyRequest(
      requestId
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error Canceling Harvest Request",
      error: error.message,
    });
  }
};

// API cập nhật yêu cầu thu hàng
const updateFuelSupplyRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const data = req.body;

    if (!requestId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Yêu cầu thu hàng ID là bắt buộc!",
      });
    }

    if (data.address && data.address.trim() === "") {
      return res.status(400).json({
        status: "ERROR",
        message: "Địa chỉ nhận hàng không được để trống!",
      });
    }

    const response = await FuelSupplyOrderService.updateFuelSupplyRequest(
      requestId,
      data
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error Updating Harvest Request",
      error: error.message,
    });
  }
};

const getById = async (req, res) => {
  try {
    const requestId = req.params.id;

    if (!requestId) {
      return res.status(400).json({
        status: "ERROR",
        message: "ID yêu cầu cung cấp là bắt buộc!",
      });
    }

    const response = await FuelSupplyOrderService.getById(requestId);

    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(404).json(response);
    }
  } catch (error) {
    console.error("Lỗi khi lấy yêu cầu cung cấp:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy yêu cầu cung cấp",
      error: error.message,
    });
  }
};

module.exports = {
  createFuelSupplyRequest,
  getAllFuelSupplyRequest,
  deleteFuelSupplyRequest,
  updateFuelSupplyRequest,
  getById,
};
