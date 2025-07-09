const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const server = http.createServer(app);

// ✅ Khởi tạo Socket.IO qua file socket.js
const socket = require("./socket");
socket.init(server);

// ✅ Middleware setup
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Setup parser với giới hạn payload lớn (ví dụ: 50mb)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ✅ Serve static images
app.use(
  "/product-image",
  express.static(path.join(__dirname, "assets/product-image"))
);

// ✅ Định nghĩa route
routes(app);

// ✅ Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("Connect Db Success"))
  .catch((err) => console.log("Your connect is fail by", err));

// ✅ Khởi động server
server.listen(port, () => {
  console.log("Server is running on port " + port);
});
