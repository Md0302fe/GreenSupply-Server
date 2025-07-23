const StorageReceiptService = require("../services/StorageReceiptService");
const MaterialStorageExportService = require("../services/MaterialStorageExportService");
const RawMaterialBatchService = require("../services/RawMaterialBatchService");
const ProductRequestService = require("../services/ProductRequestService");
const ProductionProcessingService = require("../services/ProductionProcessingService");
const UserService = require("../services/UserService");
const { getFuelStorageById } = require("../services/StorageReceiptService");
const storage_id = "665480f9bde459d62ca7d001";
const { SupplierOrderDashboard } = require("../services/OrderService");
const MaterialService = require("../services/MaterialManagementService");
const ProductService = require("../services/ProductService");




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

    const productionProcessChart =
      await ProductionProcessingService.getProductionProcessChartData();

    const userOverviewRes = await UserService.getUserOverview();
    const roleDistribution = userOverviewRes?.data?.role || [];
    const warehouseCapacityRaw = await StorageReceiptService.getFuelStorageById(storage_id);
    const supplierOrderStats = await SupplierOrderDashboard();
    const fuelTypesOverview = await MaterialService.getFuelTypesOverview();
    const dashboardBoxSummary = await MaterialService.getDashboardSummary();
    const rawMaterialDistribution = dashboardBoxSummary?.rawMaterial?.typeBreakdown || {};
    const packagingDistribution = dashboardBoxSummary?.boxCategory?.typeBreakdown || {};
    const summaryStats = await ProductionProcessingService.getDashboardprocess();
    const productDashboard = await ProductService.getProductDashboard();


    const used = warehouseCapacityRaw.capacity - warehouseCapacityRaw.remaining_capacity;
    const usagePercent = Math.round((used / warehouseCapacityRaw.capacity) * 100);
    const warehouseCapacity = {
      name: warehouseCapacityRaw.name_storage,
      capacity: warehouseCapacityRaw.capacity,
      remaining: warehouseCapacityRaw.remaining_capacity,
      used,
      usagePercent,
    };


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
        productionProcessChart,
        roleDistribution,
        warehouseCapacity,
        supplierOrderStats,
        fuelDistribution: fuelTypesOverview?.fuelData || [],
        packagingDistribution,
        rawMaterialDistribution,
        summaryStats,
        productDashboard
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
