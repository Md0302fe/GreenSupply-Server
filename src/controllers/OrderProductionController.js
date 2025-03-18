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


const getAllOrdersDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await OrderProductionService.getAllOrdersDetail(id);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return res.status(500).json({ message: error.message });
  }
};


const updateOrderOrderProduction = async (req, res) => {
  try {
    const orderId = req.params.id;
    const data = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Mã đơn hàng là bắt buộc!",
      });
    }

    const response = await OrderProductionService.updateOrderOrderProduction(orderId, data);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật đơn hàng sản xuất",
      error: error.message,
    });
  }
};


module.exports = { getAllOrders,
  createOrderProductions,
  getAllOrdersDetail,
  updateOrderOrderProduction,
 };

