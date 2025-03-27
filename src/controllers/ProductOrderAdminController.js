const ProductOrderAdminService = require("../services/ProductOrderAdminService");


const getAllOrders = async (req, res) => {
  try {
    const filters = req.query;
    const response = await ProductOrderAdminService.getAllOrders(filters);
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
    const response = await ProductOrderAdminService.getAllOrdersDetail(id);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return res.status(500).json({ message: error.message });
  }
};


  const updateOrderProcessing = async (req, res) => {
    try {
      const { id } = req.params;
      const response = await ProductOrderAdminService.updateOrderStatus(id, "Đang xử lý");
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error updating status to Processing:", error);
      return res.status(500).json({ message: error.message });
    }
  };


  const updateOrderShipping = async (req, res) => {
    try {
      const { id } = req.params;
      const response = await ProductOrderAdminService.updateOrderStatus(id, "Đang vận chuyển");
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error updating status to Shipping:", error);
      return res.status(500).json({ message: error.message });
    }
  };


  const updateOrderDelivered = async (req, res) => {
    try {
      const { id } = req.params;
      const response = await ProductOrderAdminService.updateOrderStatus(id, "Đã giao hàng");
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error updating status to Delivered:", error);
      return res.status(500).json({ message: error.message });
    }
  };
 

module.exports = { getAllOrders,getAllOrdersDetail,updateOrderProcessing,
    updateOrderShipping,
    updateOrderDelivered,

 };

