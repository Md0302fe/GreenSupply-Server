const HarvestRequestService = require("../services/HarvestRequestService.js");

// API tạo yêu cầu thu hàng
const createHarvestRequest = async (req, res) => {
  try {
    const {
      supplier_id,
      fuel_name,
      quantity,
      price,
      total_price,
      address,
      note,
      status,
      fuel_type,
      priority,
    } = req.body;

    if (!supplier_id || !fuel_name || !address) {
      return res.status(400).json({
        message:
          "Dữ liệu không hợp lệ! (thiếu supplier_id, fuel_name hoặc address)",
      });
    }

    const response = await HarvestRequestService.createHarvestRequest({
      supplier_id,
      fuel_name,
      quantity,
      price,
      total_price,
      address,
      note,
      status,
      fuel_type,
      priority,
    });

    return res.status(201).json(response);
  } catch (error) {
    console.log("Error:", error);
    if (error.status && error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error Creating Harvest Request",
      error: error.message,
    });
  }
};

// API cập nhật yêu cầu thu hàng
const updateHarvestRequest = async (req, res) => {
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

    const response = await HarvestRequestService.updateHarvestRequest(
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

// API hủy yêu cầu thu hàng
const cancelHarvestRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    if (!requestId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Yêu cầu thu hàng ID là bắt buộc!",
      });
    }

    const response = await HarvestRequestService.cancelHarvestRequest(
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

const getHarvestRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const response = await HarvestRequestService.getHarvestRequestById(
      requestId
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

const getAllHarvestRequests = async (req, res) => {
  try {
    const user = req.query.user_id;
    const response = await HarvestRequestService.getAllHarvestRequests(user);
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

// Get Harvest Request Histories
const getHarvestRequestHistories = async (req, res) => {
  try {
    const user = req.query.user_id;
    const response = await HarvestRequestService.getHarvestRequestHistories(
      user
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

module.exports = {
  createHarvestRequest,
  updateHarvestRequest,
  cancelHarvestRequest,
  getHarvestRequestById,
  getAllHarvestRequests,
  getHarvestRequestHistories,
};
