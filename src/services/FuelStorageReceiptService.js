const FuelStorageReceipt = require("../models/Fuel_Storage_Receipt");
const FuelStorage = require("../models/Fuel_Storage");
const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");
// 🟢 Tạo đơn nhập kho
// const createFuelStorageReceipt = async (manager_id, receipt_supply_id, receipt_request_id) => {
//     try {
//         if (!receipt_supply_id && !receipt_request_id) {
//             throw new Error("Phải có ít nhất một đơn hàng.");
//         }

//         // 🟢 Lấy quantity từ `FuelRequest` hoặc `FuelSupplyOrder`
//         const quantity = await getQuantityByReceiptId(receipt_supply_id, receipt_request_id);

//         // 🟢 Set cứng `storage_id` vì chỉ có 1 kho
//         const storage_id = "67958adf4223924d599a7a41";

//         // 🟢 Tạo đơn nhập kho
//         const newReceipt = new FuelStorageReceipt({
//             manager_id,
//             storage_id,
//             storage_date: new Date(),
//             receipt_supply_id: receipt_supply_id || null,
//             receipt_request_id: receipt_request_id || null,
//             quantity,
//         });

//         return await newReceipt.save();
//     } catch (error) {
//         throw new Error("Lỗi khi tạo đơn nhập kho: " + error.message);
//     }
// };

const createFuelStorageReceipt = async (
  manager_id,
  receipt_supply_id,
  receipt_request_id
) => {
  try {
    if (!receipt_supply_id && !receipt_request_id) {
      throw new Error("Phải có ít nhất một đơn hàng.");
    }

    const quantity = await getQuantityByReceiptId(
      receipt_supply_id,
      receipt_request_id
    );
    const storage_id = "67958adf4223924d599a7a41";

    const newReceipt = new FuelStorageReceipt({
      manager_id,
      storage_id,
      storage_date: new Date(),
      receipt_supply_id: receipt_supply_id || null,
      receipt_request_id: receipt_request_id || null,
      quantity,
    });

    await newReceipt.save();

    // Cập nhật trạng thái đơn hàng thành "Đang xử lý"
    if (receipt_request_id) {
        await FuelRequest.findByIdAndUpdate(receipt_request_id, { status: "Đang xử lý" });
    } else if (receipt_supply_id) {
        await FuelSupplyOrder.findByIdAndUpdate(receipt_supply_id, { status: "Đang xử lý" });
    }

    return newReceipt;
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
      .populate("manager_id", "full_name") // 🔹 Chỉ lấy `full_name`
      .populate("storage_id", "name_storage") // 🔹 Chỉ lấy `name_storage`
      .populate("receipt_supply_id receipt_request_id")
      .sort(sortOptions);

    console.log("🔍 Dữ liệu trước khi lọc:", receipts);

    if (search) {
      const regexSearch = new RegExp(search, "i"); // Không phân biệt hoa thường
      receipts = receipts.filter(
        (receipt) =>
          regexSearch.test(receipt.manager_id?.full_name || "") || // 🔍 Tìm theo tên quản lý
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
    const validStatuses = ["Nhập kho thành công", "Chờ duyệt", "Đã duyệt", "Đã huỷ"];
    if (!validStatuses.includes(status)) {
      throw new Error("Trạng thái không hợp lệ!");
    }

    // 🟢 Lấy thông tin đơn nhập kho
    const receipt = await FuelStorageReceipt.findById(id);
    if (!receipt) {
      throw new Error("Không tìm thấy đơn nhập kho!");
    }

    // 🟢 Nếu duyệt đơn, cập nhật sức chứa kho & trạng thái đơn hàng chờ nhập kho
    if (status === "Nhập kho thành công") {
        const storage = await FuelStorage.findById(receipt.storage_id);
        if (!storage) {
            throw new Error("Không tìm thấy kho!");
        }

        // 🟢 Kiểm tra sức chứa kho
        if (receipt.quantity > storage.remaining_capacity) {
            throw new Error("Kho không đủ sức chứa!");
        }

        // 🟢 Cập nhật số lượng trong kho
        storage.remaining_capacity -= receipt.quantity;
        await storage.save();

        // 🟢 Cập nhật trạng thái đơn hàng chờ nhập kho thành "Nhập kho thành công"
        await updateOrderStatus(receipt.receipt_supply_id || receipt.receipt_request_id, "Hoàn Thành");
    }

    // // 🟢 Nếu hủy đơn nhập kho, cập nhật trạng thái đơn hàng chờ nhập kho thành "Nhập kho thất bại"
    if (status === "Đã huỷ") {
        await updateOrderStatus(receipt.receipt_supply_id || receipt.receipt_request_id, "thất bại");
    }

    // 🟢 Cập nhật trạng thái đơn nhập kho
    receipt.status = status;
    await receipt.save();

    return receipt;
  } catch (error) {
    console.error(
      "❌ Lỗi khi cập nhật trạng thái đơn nhập kho:",
      error.message
    );
    throw new Error("Lỗi khi cập nhật trạng thái: " + error.message);
  }
};

// 🟢 Hàm cập nhật trạng thái trong `FuelRequest` hoặc `FuelSupplyOrder`
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const order =
      (await FuelRequest.findById(orderId)) ||
      (await FuelSupplyOrder.findById(orderId));
    if (!order) throw new Error("Không tìm thấy đơn hàng chờ nhập kho!");

    order.status = newStatus;
    await order.save();
  } catch (error) {
    console.error(
      "❌ Lỗi khi cập nhật trạng thái đơn hàng chờ nhập kho:",
      error.message
    );
    throw new Error("Lỗi khi cập nhật trạng thái đơn hàng: " + error.message);
  }
};

const getQuantityByReceiptId = async (
  receipt_supply_id,
  receipt_request_id
) => {
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

const getFuelStorageById = async (storage_id) => {
  try {
    const storage = await FuelStorage.findById(storage_id);
    if (!storage) {
      throw new Error("Không tìm thấy kho!");
    }
    return storage;
  } catch (error) {
    throw new Error("Lỗi khi lấy thông tin kho: " + error.message);
  }
};

//Dashboard
const getTotalFuelStorageReceipts = async () => {
  try {
    // Lấy tổng số đơn nhập kho
    const totalReceipts = await FuelStorageReceipt.countDocuments({ is_deleted: false });

    // Lấy ngày sớm nhất và muộn nhất từ database
    const startDateRecord = await FuelStorageReceipt.findOne({ is_deleted: false }).sort({ storage_date: 1 }).select('storage_date');
    const endDateRecord = await FuelStorageReceipt.findOne({ is_deleted: false }).sort({ storage_date: -1 }).select('storage_date');
    
    if (!startDateRecord || !endDateRecord) {
      throw new Error("Không có dữ liệu nhập kho");
    }

    const startDate = startDateRecord.storage_date;
    const endDate = endDateRecord.storage_date;

    // Định dạng lại ngày theo chuỗi
    const startFormatted = `${new Date(startDate).getDate()} tháng ${new Date(startDate).getMonth() + 1}`;
    const endFormatted = `${new Date(endDate).getDate()} tháng ${new Date(endDate).getMonth() + 1}`;

    const dateRange = `Từ ${startFormatted} - ${endFormatted}`;

    // Trả về cả tổng số đơn và khoảng thời gian
    return { totalReceipts, dateRange };
  } catch (error) {
    throw new Error("Lỗi khi lấy tổng số đơn nhập kho và khoảng thời gian: " + error.message);
  }
};

const getStockImportByDate = async () => {
  try {
    // Truy vấn số lượng đơn nhập kho theo ngày
    const result = await FuelStorageReceipt.aggregate([
      {
        $match: { is_deleted: false } // Lọc các đơn nhập kho hợp lệ
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d-%m-%Y", date: "$storage_date" } }, // Định dạng ngày theo "ngày-tháng-năm"
          totalImports: { $sum: 1 }, // Đếm số đơn nhập kho trong mỗi ngày
        }
      },
      {
        $sort: { _id: 1 } // Sắp xếp theo ngày
      }
    ]);

    return result;
  } catch (error) {
    throw new Error("Lỗi khi lấy số lượng đơn nhập kho theo ngày: " + error.message);
  }
};

const getStockImportCompletedByDate = async () => {
  try {
    const result = await FuelStorageReceipt.aggregate([
      {
        $match: {
          is_deleted: false,
          status: "Đã duyệt",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m-%Y", date: "$storage_date" },
          },
          totalImports: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return result;
  } catch (error) {
    throw new Error("Lỗi khi lấy số lượng đơn nhập kho hoàn thành theo ngày: " + error.message);
  }
};


module.exports = {
  createFuelStorageReceipt,
  getAllFuelStorageReceipts,
  updateFuelStorageReceiptStatus,
  getQuantityByReceiptId,
  getFuelStorageById,
  getTotalFuelStorageReceipts,
  getStockImportByDate,
  getStockImportCompletedByDate,
};
