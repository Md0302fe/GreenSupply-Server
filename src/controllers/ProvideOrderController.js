const OrderServices = require("../services/OrderService");

const getAllProvideOrders = async (req, res) => {
    try {
      const filters = req.query;
      const response = await OrderServices.getAllProvideOrders(filters);
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
    getAllProvideOrders,
  };