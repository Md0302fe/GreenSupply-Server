const FuelEntryService = require("../services/PurchaseMaterialPlanService");

const getAll = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const options = {};

    if (page && limit) {
      options.paginate = true;
      options.page = parseInt(page) || 1;
      options.limit = parseInt(limit) || 10;
    }

    const response = await FuelEntryService.getAll(options);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi trong getAllFuel controller:", error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi server khi lấy danh sách nhiên liệu",
      error: error.message,
    });
  }
};

const getFuelEntryDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await FuelEntryService.getFuelEntryDetail(id);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAll,
  getFuelEntryDetail,
};
