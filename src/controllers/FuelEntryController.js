const FuelEntryService = require("../services/FuelEntryService");

const getAll = async (req, res) => {
  try {
    const response = await FuelEntryService.getAll();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi trong getAllAddresses controller:", error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi server khi lấy danh sách địa chỉ",
      error: error.message,
    });
  }
};

module.exports = {
  getAll,
};