const SupplyOrderService = require("../services/SupplyOrderService.js");

const createSupplyRequest = async (req, res) => {
  try {
    const {
      request_id,
      start_received,
      end_received,
      price,
      remaining_quantity,
      priority,
      note
    } = req.body;

    if (!request_id || !start_received || !end_received || !price || !remaining_quantity) {
      return res.status(400).json({
        message: "Thiếu dữ liệu bắt buộc! Vui lòng kiểm tra request_id, start_received, end_received, price, remaining_quantity."
      });
    }

    const response = await SupplyOrderService.createSupplyRequest({
      request_id,
      start_received,  // Nhận từ Date Picker của frontend
      end_received,
      price,
      remaining_quantity,
      priority,
      note
    });

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
  createSupplyRequest,
};
