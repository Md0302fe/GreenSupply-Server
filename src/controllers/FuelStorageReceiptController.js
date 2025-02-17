const FuelStorageReceiptService = require("../services/FuelStorageReceiptService");

// 🟢 1. Tạo đơn nhập kho
const createFuelStorageReceipt = async (req, res) => {
    try {
        const manager_id = req.user?.id; // Lấy từ token
        if (!manager_id) {
            return res.status(401).json({ success: false, message: "Không có quyền tạo đơn nhập kho." });
        }

        const { receipt_supply_id, receipt_request_id } = req.body;

        const newReceipt = await FuelStorageReceiptService.createFuelStorageReceipt(manager_id, receipt_supply_id, receipt_request_id);

        return res.status(201).json({ success: true, data: newReceipt });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createFuelStorageReceipt };
