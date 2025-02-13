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

module.exports = {
  createFuelSupplyRequest,
};
