const FuelStorageReceipt = require("../models/Fuel_Storage_Receipt");
const FuelStorage = require("../models/Fuel_Storage");
const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");
// 🟢 Tạo đơn nhập kho
const createFuelStorageReceipt = async (manager_id, receipt_supply_id, receipt_request_id) => {
    try {
        if (!receipt_supply_id && !receipt_request_id) {
            throw new Error("Phải có ít nhất một đơn hàng.");
        }

        // 🟢 Lấy quantity từ `FuelRequest` hoặc `FuelSupplyOrder`
        const quantity = await getQuantityByReceiptId(receipt_supply_id, receipt_request_id);

        // 🟢 Set cứng `storage_id` vì chỉ có 1 kho
        const storage_id = "67958adf4223924d599a7a41";

        // 🟢 Tạo đơn nhập kho
        const newReceipt = new FuelStorageReceipt({
            manager_id,
            storage_id,
            storage_date: new Date(),
            receipt_supply_id: receipt_supply_id || null,
            receipt_request_id: receipt_request_id || null,
            quantity,
        });

        return await newReceipt.save();
    } catch (error) {
        throw new Error("Lỗi khi tạo đơn nhập kho: " + error.message);
    }
};


const getAllFuelStorageReceipts = async (query) => {
    try {
        let { search, status, sortOrder } = query;
        let filter = { is_deleted: false };

        console.log("📥 API nhận request:", { search, status, sortOrder });

        // 🟢 1. Filter - Lọc theo trạng thái đơn
        if (status) {
            filter.status = status;
        }

        // 🟢 2. Sort - Sắp xếp theo `createdAt`
        let sortOptions = { createdAt: sortOrder === "asc" ? 1 : -1 }; // Mặc định mới nhất trước

        // 🟢 3. Query Database (lấy tất cả dữ liệu trước)
        let receipts = await FuelStorageReceipt.find(filter)
            .populate("manager_id", "full_name")  // 🔹 Chỉ lấy `full_name`
            .populate("storage_id", "name_storage") // 🔹 Chỉ lấy `name_storage`
            .populate("receipt_supply_id receipt_request_id")
            .sort(sortOptions);

        console.log("🔍 Dữ liệu trước khi lọc:", receipts);

        // 🟢 4. Lọc dữ liệu theo `search`
        // 🟢 4. Lọc dữ liệu theo `search`
if (search) {
    const regexSearch = new RegExp(search, "i"); // Không phân biệt hoa thường
    receipts = receipts.filter(receipt =>
        regexSearch.test(receipt.manager_id?.full_name || "") ||  // 🔍 Tìm theo tên quản lý
        regexSearch.test(receipt.storage_id?.name_storage || "") || // 🔍 Tìm theo tên kho
        regexSearch.test(receipt.status || "") || // 📌 Tìm theo trạng thái
        regexSearch.test(receipt.note || "") || // ✍ Tìm theo ghi chú
        (receipt.quantity && receipt.quantity.toString().includes(search)) || // 🔢 Tìm theo số lượng
        regexSearch.test(receipt.receipt_supply_id ? "Cung cấp" : "Thu hàng") // 🔍 Tìm theo loại đơn hàng
    );
}


        console.log("🔍 Dữ liệu sau khi lọc:", receipts);

        return receipts;
    } catch (error) {
        throw new Error("Lỗi khi lấy danh sách đơn nhập kho: " + error.message);
    }
};






const updateFuelStorageReceiptStatus = async (id, status) => {
    try {
        const validStatuses = ["Chờ duyệt", "Đã duyệt", "Đã huỷ"];
        if (!validStatuses.includes(status)) {
            throw new Error("Trạng thái không hợp lệ!");
        }
  
        // 🟢 Lấy thông tin đơn nhập kho
        const receipt = await FuelStorageReceipt.findById(id);
        if (!receipt) {
            throw new Error("Không tìm thấy đơn nhập kho!");
        }
  
        // 🟢 Nếu duyệt đơn, cần cập nhật sức chứa kho
        if (status === "Đã duyệt") {
            const storage = await FuelStorage.findById(receipt.storage_id);
            if (!storage) {
                throw new Error("Không tìm thấy kho!");
            }
  
            // 🟢 Lấy `quantity` từ đơn nhập kho
            const quantity = receipt.quantity;
  
            // 🟢 Kiểm tra sức chứa kho
            if (quantity > storage.remaining_capacity) {
                throw new Error("Kho không đủ sức chứa!");
            }
  
            // 🟢 Trừ `quantity` vào `remaining_capacity`
            storage.remaining_capacity -= quantity;
            await storage.save();
        }
  
        // 🟢 Cập nhật trạng thái đơn nhập kho
        receipt.status = status;
        await receipt.save();
  
        return receipt;
    } catch (error) {
        throw new Error("Lỗi khi cập nhật trạng thái: " + error.message);
    }
  };
  

  const getQuantityByReceiptId = async (receipt_supply_id, receipt_request_id) => {
    try {
        if (receipt_supply_id) {
            const supplyOrder = await FuelSupplyOrder.findById(receipt_supply_id);
            if (!supplyOrder) throw new Error("Không tìm thấy đơn hàng cung cấp!");
            return supplyOrder.quantity;
        }

        if (receipt_request_id) {
            const requestOrder = await FuelRequest.findById(receipt_request_id);
            if (!requestOrder) throw new Error("Không tìm thấy yêu cầu nhập hàng!");
            return requestOrder.quantity;
        }

        throw new Error("Phải có ít nhất một đơn hàng (supply hoặc request).");
    } catch (error) {
        throw new Error("Lỗi khi lấy số lượng nhiên liệu: " + error.message);
    }
};

module.exports = { createFuelStorageReceipt, getAllFuelStorageReceipts, updateFuelStorageReceiptStatus, getQuantityByReceiptId };
