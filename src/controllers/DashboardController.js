const StorageReceiptService = require("../services/StorageReceiptService");
const MaterialStorageExportService = require("../services/MaterialStorageExportService");
const RawMaterialBatchService = require("../services/RawMaterialBatchService");
const ProductRequestService = require("../services/ProductRequestService");


const getDashboardOverview = async (req, res) => {
  try {
    // 🔹 Lấy tổng số đơn nhập kho
    const { totalReceipts, dateRange: receiptDateRange } =
      await StorageReceiptService.getTotalFuelStorageReceipts();

    // 🔹 Lấy tổng số đơn xuất kho
    const { totalExports, dateRange: exportDateRange } =
      await MaterialStorageExportService.getTotalMaterialStorageExports();

    // 🔹 Lấy tổng số lô nguyên liệu
    const { totalBatches, dateRange: batchDateRange } =
      await RawMaterialBatchService.getTotalRawMaterialBatches();

    // 🔹 Lấy số đơn nhập & xuất kho theo ngày
    const stockImportByDate =
      await StorageReceiptService.getStockImportByDate();

    // 🔹 Lấy số đơn nhập kho đã hoàn thành theo ngày
    const stockImportCompletedByDate =
      await StorageReceiptService.getStockImportCompletedByDate();

    // 🔹 Lấy số đơn xuất kho đã hoàn thành theo ngày
    const stockExportCompletedByDate =
      await MaterialStorageExportService.getStockExportCompletedByDate();

    // 🔹 Lấy biểu đồ sản xuất
    const productionChartResult =
      await ProductRequestService.getProductionChartData();

    // ✅ Trả dữ liệu hợp nhất về client
    return res.status(200).json({
      success: true,
      data: {
        totalReceipts,
        receiptDateRange,
        totalExports,
        exportDateRange,
        totalBatches,
        batchDateRange,
        stockImportByDate,
        stockImportCompletedByDate,
        stockExportCompletedByDate,
        productionChartData: productionChartResult.data || [],
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu dashboard:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu tổng quan dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardOverview,
};
