//Dòng này dùng để import UserRouter từ file ./UserRouter. File này chứa tất cả các route liên quan đến người dùng (user), ví dụ như các API cho việc đăng ký, đăng nhập, cập nhật thông tin người dùng, v.v.
const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const PurchaseOrderRouter = require("./PurchaseOrderRouter");
const HarvestRequestRouter = require("./HarvestRequestRouter");
const FuelSupplyOrderRouter = require("./FuelSupplyOrderRouter");
const FuelEntryRoutes = require("./FuelEntryRoutes");
const FuelManagementRoutes = require("./FuelManagementRoutes");
const ProductRequestRouter = require("./ProductRequestRouter");
const FuelStorageReceipt = require("./FuelStorageReceipt");
const FuelRoute = require("./FuelRoutes");
const RawMaterialBatchRouter = require("./RawMaterialBatchRouter")
const MarterialStorageExportRouter = require("./MaterialStorageExportRouter");
const BatchHistoryRouter = require("./BatchHistoryRouter")
// const FuelStorageReceipt  = require("./FuelStorageReceipt");
const OrderProductionRoutes = require("./OrderProductionRoutes");
const OrderRoutes = require("./OrderRoutes");
const ProvideOrderRoutes = require("./ProvideOrderRoutes");
const userAddressRoutes = require("./UserAddressRoutes");
const ProductOrderAdminRouter = require("./ProductOrderAdminRouter");
//  Định nghĩa hàm routes
//  Đây là một hàm nhận vào đối tượng app (chính là instance của ứng dụng Express).
const routes = (app) => {
  // Tất cả các endpoint được định nghĩa trong UserRouter sẽ có tiền tố /api/user.
  app.use("/api/user", UserRouter);

  app.use("/api/orders-production", OrderProductionRoutes);
  app.use("/api/product-orders", ProductOrderAdminRouter);
  app.use("/api/orders", OrderRoutes);
  app.use("/api/provide-order", ProvideOrderRoutes);
  app.use("/api/fuel", FuelEntryRoutes);
  app.use("/api/fuel-management", FuelManagementRoutes);
  app.use("/api/product-request", ProductRequestRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/harvest-request", HarvestRequestRouter);
  app.use("/api/fuel-supply-request", FuelSupplyOrderRouter);
  app.use("/api/fuel-storage", FuelStorageReceipt);
  app.use("/api/fuel", FuelRoute);
  app.use("/api/purchase-order", PurchaseOrderRouter);
  app.use("/api", userAddressRoutes);
  app.use("/api/raw-material-batch", RawMaterialBatchRouter);
  app.use("/api/material-storage-export", MarterialStorageExportRouter);
  app.use("/api/batch-history", BatchHistoryRouter);


  // app.use("/api/fuel-storage", FuelStorageReceipt);
};
module.exports = routes;

// UserRouter: Đây là nơi bạn định nghĩa các route liên quan đến người dùng trong file
// UserRouter.js. File này có thể chứa các endpoint như GET /users, POST /users, PUT /users/:id, v.v.
