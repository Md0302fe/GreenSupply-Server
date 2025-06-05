//Dòng này dùng để import UserRouter từ file ./UserRouter. File này chứa tất cả các route liên quan đến người dùng (user), ví dụ như các API cho việc đăng ký, đăng nhập, cập nhật thông tin người dùng, v.v.
const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const PurchaseOrderRouter = require("./PurchaseOrderRouter");
const HarvestRequestRouter = require("./HarvestRequestRouter");
const MaterialProvideRequestRouter = require("./MaterialProvideRequestRouter"); // done
const PurchaseMaterialPlanRoutes = require("./PurchaseMaterialPlanRoutes"); // done
const MaterialManagementRoutes = require("./MaterialManagementRoutes"); // done
const ProductRequestRouter = require("./ProductRequestRouter");
const ProductionProcessingRouter = require("./ProductionProcessingRouter");
const StorageReceipt = require("./StorageReceipt");
const FuelRouter = require("./MaterialRoutes");
const RawMaterialBatchRouter = require("./RawMaterialBatchRouter")
const MarterialStorageExportRouter = require("./MaterialStorageExportRouter");
const BatchHistoryRouter = require("./BatchHistoryRouter")
// const StorageReceipt  = require("./StorageReceipt");
const OrderProductionRoutes = require("./OrderProductionRoutes");
const OrderRoutes = require("./OrderRoutes");
const ProvideOrderRoutes = require("./ProvideOrderRoutes");
const userAddressRoutes = require("./UserAddressRoutes");
const ProductOrderAdminRouter = require("./ProductOrderAdminRouter");
const PackageMaterialRouter = require("./PackageMaterialRouter");
//  Định nghĩa hàm routes
//  Đây là một hàm nhận vào đối tượng app (chính là instance của ứng dụng Express).
const routes = (app) => {
  // Tất cả các endpoint được định nghĩa trong UserRouter sẽ có tiền tố /api/user.
  app.use("/api/user", UserRouter);

  app.use("/api/orders-production", OrderProductionRoutes);
  app.use("/api/product-orders", ProductOrderAdminRouter);
  app.use("/api/orders", OrderRoutes);
  app.use("/api/provide-order", ProvideOrderRoutes);
  app.use("/api/fuel", PurchaseMaterialPlanRoutes);
  app.use("/api/fuel-management", MaterialManagementRoutes);
  app.use("/api/product-request", ProductRequestRouter);
  app.use("/api/production-processing", ProductionProcessingRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/harvest-request", HarvestRequestRouter);
  app.use("/api/fuel-supply-request", MaterialProvideRequestRouter);
  app.use("/api/fuel-storage", StorageReceipt);
  app.use("/api/fuel", FuelRouter);
  app.use("/api/purchase-order", PurchaseOrderRouter);
  app.use("/api", userAddressRoutes);
  app.use("/api/raw-material-batch", RawMaterialBatchRouter);
  app.use("/api/material-storage-export", MarterialStorageExportRouter);
  app.use("/api/batch-history", BatchHistoryRouter);
  app.use("/api/package-material", PackageMaterialRouter);

  // app.use("/api/fuel-storage", StorageReceipt);
};
module.exports = routes;

// UserRouter: Đây là nơi bạn định nghĩa các route liên quan đến người dùng trong file
// UserRouter.js. File này có thể chứa các endpoint như GET /users, POST /users, PUT /users/:id, v.v.
