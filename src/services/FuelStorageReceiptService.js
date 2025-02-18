const FuelStorageReceipt = require("../models/Fuel_Storage_Receipt");
const FuelStorage = require("../models/Fuel_Storage");
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

const getAllFuelStorageReceipts = async () => {
  try {
      return await FuelStorageReceipt.find({ is_deleted: false })
          .populate("manager_id storage_id receipt_supply_id receipt_request_id");
  } catch (error) {
      throw new Error("Lỗi khi lấy danh sách đơn nhập kho: " + error.message);
  }
};

const updateFuelStorageReceiptStatus = async (id, status) => {
  try {
      // Kiểm tra trạng thái hợp lệ
      const validStatuses = ["Chờ duyệt", "Đã duyệt", "Đã huỷ"];
      if (!validStatuses.includes(status)) {
          throw new Error("Trạng thái không hợp lệ!");
      }

      // Cập nhật trạng thái đơn hàng
      const updatedReceipt = await FuelStorageReceipt.findByIdAndUpdate(
          id,
          { status },
          { new: true }
      );

      if (!updatedReceipt) {
          throw new Error("Không tìm thấy đơn nhập kho!");
      }

      return updatedReceipt;
  } catch (error) {
      throw new Error("Lỗi khi cập nhật trạng thái: " + error.message);
  }
};


module.exports = { createFuelStorageReceipt, getAllFuelStorageReceipts, updateFuelStorageReceiptStatus };
