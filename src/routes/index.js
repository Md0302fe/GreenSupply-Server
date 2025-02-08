//Dòng này dùng để import UserRouter từ file ./UserRouter. File này chứa tất cả các route liên quan đến người dùng (user), ví dụ như các API cho việc đăng ký, đăng nhập, cập nhật thông tin người dùng, v.v.
const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const HarvestRequestRouter = require("./HarvestRequestRouter");
const SupplyRequestRouter = require("./SupplyRequestRouter");

//  Định nghĩa hàm routes
//  Đây là một hàm nhận vào đối tượng app (chính là instance của ứng dụng Express).
const routes = (app) => {
  // Tất cả các endpoint được định nghĩa trong UserRouter sẽ có tiền tố /api/user.
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/harvest-request", HarvestRequestRouter);
  app.use("/api/supply-request", SupplyRequestRouter);
};
module.exports = routes;

// UserRouter: Đây là nơi bạn định nghĩa các route liên quan đến người dùng trong file
// UserRouter.js. File này có thể chứa các endpoint như GET /users, POST /users, PUT /users/:id, v.v.
