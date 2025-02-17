const FuelStorageReceipt = require("../models/Fuel_Storage_Receipt");

// 🟢 Tạo đơn nhập kho
const createFuelStorageReceipt = async (manager_id, receipt_supply_id, receipt_request_id) => {
    try {
        if (!receipt_supply_id && !receipt_request_id) {
            throw new Error("Phải có ít nhất một đơn hàng.");
        }

        // 🟢 Set cứng `storage_id` vì chỉ có 1 kho
        const storage_id = "67958adf4223924d599a7a41";

        // 🟢 Tạo đơn nhập kho
        const newReceipt = new FuelStorageReceipt({
            manager_id,
            storage_id,
            storage_date: new Date(),
            receipt_supply_id: receipt_supply_id || null,
            receipt_request_id: receipt_request_id || null,
        });

        return await newReceipt.save();
    } catch (error) {
        throw new Error("Lỗi khi tạo đơn nhập kho: " + error.message);
    }
};

module.exports = { createFuelStorageReceipt };
