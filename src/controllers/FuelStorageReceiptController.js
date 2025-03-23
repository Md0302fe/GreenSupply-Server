const FuelStorageReceiptService = require("../services/FuelStorageReceiptService");

// 🟢 1. Tạo đơn nhập kho
const createFuelStorageReceipt = async (req, res) => {
  try {
    const manager_id = req.user?.id; // Lấy từ token
    if (!manager_id) {
      return res
        .status(401)
        .json({ success: false, message: "Không có quyền tạo đơn nhập kho." });
    }

    const { receipt_supply_id, receipt_request_id } = req.body;

    const newReceipt = await FuelStorageReceiptService.createFuelStorageReceipt(
      manager_id,
      receipt_supply_id,
      receipt_request_id
    );

    return res.status(201).json({ success: true, data: newReceipt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllFuelStorageReceipts = async (req, res) => {
  try {
    const receipts = await FuelStorageReceiptService.getAllFuelStorageReceipts(
      req.query
    );
    return res.status(200).json({ success: true, data: receipts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateFuelStorageReceiptStatus = async (req, res) => {
  try {
    const { id } = req.params; // ID đơn nhập kho từ URL
    const { status } = req.body; // Trạng thái mới từ body request

    const updatedReceipt =
      await FuelStorageReceiptService.updateFuelStorageReceiptStatus(
        id,
        status
      );

    return res.status(200).json({ success: true, data: updatedReceipt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getFuelStorageById = async (req, res) => {
  try {
    const { id } = req.params; // storage_id từ URL

    const storage = await FuelStorageReceiptService.getFuelStorageById(id);

    return res.status(200).json({ success: true, data: storage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//Dashboard
const getTotalFuelStorageReceipts = async (req, res) => {
  try {
    // Lấy tổng số đơn nhập kho và khoảng thời gian từ service
    const { totalReceipts, dateRange } =
      await FuelStorageReceiptService.getTotalFuelStorageReceipts();

    // Trả về kết quả cho client
    return res.status(200).json({
      success: true,
      data: {
        totalReceipts,
        dateRange,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getStockImportByDate = async (req, res) => {
  try {
    const data = await FuelStorageReceiptService.getStockImportByDate();
    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStockImportCompletedByDate = async (req, res) => {
  try {
    const data = await FuelStorageReceiptService.getStockImportCompletedByDate();
    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  createFuelStorageReceipt,
  getAllFuelStorageReceipts,
  updateFuelStorageReceiptStatus,
  getFuelStorageById,
  getTotalFuelStorageReceipts,
  getStockImportByDate,
  getStockImportCompletedByDate,
};
