const OrderProductionService = require("../services/OrderProductionService");

const createOrderProductions = async (req, res) => {
  try {
    const response = await OrderProductionService.createOrderProductions(req.body);
    return res.status(201).json(response);
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const filters = req.query;
    const response = await OrderProductionService.getAllOrders(filters);
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

module.exports = { getAllOrders,
  createOrderProductions,
 };

