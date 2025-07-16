const jwt = require("jsonwebtoken"); // import jsonwebtoken
const dotenv = require("dotenv");
dotenv.config(); // process.env

  // Kiểm tra user (tk) - chỉ cho phép tài khoảng (admin) mới sử dụng được tính năng
const authAdminMidleware = async (req, res, next) => {
  // verify a token symmetric
  console.log("req.headers.token => ", req.headers.token)
  
  const stringToken = req.headers.token.split(" ");
  const token = stringToken[1];
  console.log("token => ", token)
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    // err: như token không hợp lệ, hết hạn, hoặc không thể giải mã
    if (err) {
      return res.status(404).json({
        status: "Error at authAdminMidleware",
        message: "The authentications get error",
      });
    } else {
      // ngược lại nếu tìm thấy token -> tiếp đến check admin và tiến hành xóa user
      //  nếu là admin -> next() / ngược lại res về lỗi
      if (user?.isAdmin === "Admin") {
        next();
      } else {
        return res.status(404).json({
          status: "Error at authAdminMidleware",
          message: "Your authentications is not available for this function",
        });
      }
    }
  });
};

 // Kiểm tra user (tk) - chỉ cho phép có tài khoảng mới sử dụng được tính năng
const authUserMidleware = async (req, res, next) => {
  try {
    // console.log("Token từ FE gửi lên:", req.headers.authorization);
    // Lấy token từ headers (chấp nhận cả "Authorization" hoặc "token")
    const tokenHeader = req.headers.authorization || req.headers.token ;

    // Nếu không có token, trả về lỗi
    if (!tokenHeader) {
      return res.status(401).json({
        status: "ERROR",
        message: "Không có token, vui lòng đăng nhập.",
      });
    }

    // Kiểm tra token có đúng định dạng "Bearer <token>"
    const tokenParts = tokenHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({
        status: "ERROR",
        message: "Token không hợp lệ.",
      });
    }

    const token = tokenParts[1]; // Lấy token thật
    
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
      if (err) {
        return res.status(403).json({
          status: "ERROR",
          message: token,
        });
      } 
      // Kiểm tra user sau khi decode token
      // console.log("Token giải mã được:", user); 
      req.user = user; // Gán thông tin user vào request
      console.log("req.user ", req.user)
      next();
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi xác thực",
      error: error.message,
    });
  }
};

module.exports = { authAdminMidleware, authUserMidleware };
