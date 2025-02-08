const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Tạo OTP
const createOtp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    //regex check email
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const isCheckEmail = regex.test(email);
    if (!name || !email || !password || !confirmPassword || !phone) {
      return res.status(200).json({
        status: "ERROR",
        message: "Bạn cần điền thông tin",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERROR",
        message: "Sai định dạng email",
      });
    } else if (password != confirmPassword) {
      return res.status(200).json({
        status: "ERROR",
        message: "Xác thực mật khẩu không chính xác",
      });
    }
    const respone = await UserService.sendOtpEmail(email, phone);
    // Log ra API check ,
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Khởi Tạo 1 New User //
const createUser = async (req, res) => {
  try {
    console.log("CHECK BE ");
    const { name, email, password, confirmPassword, phone } = req.body;
    //regex check email
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const isCheckEmail = regex.test(email);
    console.log(req.body);
    if (!name || !email || !password || !confirmPassword || !phone) {
      return res.status(200).json({
        status: "ERROR",
        message: "Bạn cần điền thông tin",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERROR",
        message: "Sai định dạng email",
      });
    } else if (password != confirmPassword) {
      return res.status(200).json({
        status: "ERROR",
        message: "Xác thực mật khẩu không chính xác",
      });
    }
    const respone = await UserService.createUser(req.body);
    // Log ra API check ,
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};
// Phương Thức kiểm tra email //
const checkEmail = async (req, res) => {
  try {
    const { emailForgot } = req.body;

    //regex check email
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const isCheckEmail = regex.test(emailForgot);
    if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERROR",
        message: "Bạn cần điền đúng định dạng email",
      });
    }
    const respone = await UserService.checkEmailForgot(emailForgot);
    // Log ra API check ,
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};
// Phương Thức kiểm tra OTP //
const checkOTP = async (req, res) => {
  try {
    const { otp, emailForgot } = req.body;
    if (!otp) {
      return res.status(200).json({
        status: "ERROR",
        message: "Bạn cần điền đúng mã otp",
      });
    }
    const respone = await UserService.verifyOtp(emailForgot, otp);
    // Log ra API check ,
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};
// Phương Thức Đổi mật khẩu //
const updatePassword = async (req, res) => {
  try {
    const { newPassword, email } = req.body;
    if (!newPassword) {
      return res.status(200).json({
        status: "ERROR",
        message: "Bạn cần điền mật khẩu mới",
      });
    }
    const respone = await UserService.updatePassword(newPassword, email);
    // Log ra API check ,
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};
// Phương Thức Khởi Tạo 1 New User //
const completeProfile = async (req, res) => {
  try {
    const respone = await UserService.completeProfile(req.body);
    // Log ra API check ,
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Login Của user
const userLogin = async (req, res) => {
  try {
    const { email, password, googleToken } = req.body;
    if (!googleToken) {
      //regex check email
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const isCheckEmail = regex.test(email);
      if (!email || !password) {
        return res.status(200).json({
          status: "ERROR",
          message: "Bạn cần điền thông tin đăng nhập",
        });
      } else if (!isCheckEmail) {
        return res.status(200).json({
          status: "ERROR",
          message: "Sai tài khoản hoặc mật khẩu",
        });
      }
    }

    const respone = await UserService.userLogin(req.body);
    // Trả về 1 json(object) respone nhận được từ phía services.
    const { refresh_token, ...newRespone } = respone;
    // set option cookie
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      samSite: "strict",
    });

    return res.status(200).json(newRespone);
  } catch (error) {
    // Trả về 1 json(object) error nhận được từ catch().
    return res.status(404).json({
      status: "ERROR",
      massage: error,
    });
  }
};

// Phương Thức Update Thông Tin Của User
const updateUser = async (req, res) => {
  try {
    console.log("body: ", req.body);

    // Lấy được id người dùng thông qua URL (/update-user/:id) / get = params
    const userId = req.params.id;
    const data = req.body;
    if (!userId) {
      res.status(200).json({
        status: "ERROR",
        message: "The userId is required!",
      });
    }
    const respone = await UserService.updateUser(userId, data);
    // Log API Check
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Delele User
const blockUser = async (req, res) => {
  try {
    // Lấy được id người dùng thông qua URL (/update-user/:id) / get = params
    const userId = req.params.id;
    if (!userId) {
      res.status(200).json({
        status: "ERROR",
        message: "The userId is required !",
      });
    }
    // Nếu user đã login -> check có phải admin hay không ?
    const respone = await UserService.blockUser(userId);
    // Log API Check
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Delele User
const unBlockUser = async (req, res) => {
  try {
    console.log("CON CAC");
    // Lấy được id người dùng thông qua URL (/update-user/:id) / get = params
    const userId = req.params.id;
    if (!userId) {
      res.status(200).json({
        status: "ERROR",
        message: "The userId is required !",
      });
    }
    // Nếu user đã login -> check có phải admin hay không ?
    const respone = await UserService.unBlockUser(userId);
    // Log API Check
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Delele User
const deleteManyUser = async (req, res) => {
  try {
    // Lấy được id người dùng thông qua URL (/update-user/:id) / get = params
    const ids = req.body;
    if (!ids) {
      res.status(200).json({
        status: "ERROR",
        message: "The ids is required !",
      });
    }
    // Nếu user đã login -> check có phải admin hay không ?
    const respone = await UserService.deleteManyUser(ids);
    // Log API Check
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Get All User
const getAllUser = async (req, res) => {
  try {
    const respone = await UserService.getAllUser();
    // Log API Check
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Get Detail User
const getDetailUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const respone = await UserService.getDetailUser(userId);
    // Log API Check
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      eMsg: error,
    });
  }
};

// Phương Thức Refresh Token For User
const refreshToken = async (req, res) => {
  try {
    // Lấy ra token từ cookie
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(200).json({
        status: "ERROR",
        message: "The token is required",
      });
    }
    const respone = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(respone);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// Phương Thức Logout
const userLogout = async (req, res) => {
  try {
    // clear cookie
    res.clearCookie("refresh_token");

    // Xóa dữ liệu trên client
    // localStorage.removeItem("access_token");
    // localStorage.removeItem("user");

    // trả về respone thành công.
    return res.status(200).json({
      status: "OK",
      message: "Logout successfully ",
    });
  } catch (error) {
    // trả về 1 đoạn lỗi.
    return res.status(404).json({
      message: error,
    });
  }
};

// Tạo địa chỉ mới
const createAddress = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ middleware
    const response = await UserService.createAddress(userId, req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi tạo địa chỉ:", error);
    return res.status(500).json({ status: "ERROR", message: "Lỗi server." });
  }
};

// Cập nhật địa chỉ
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ middleware
    const addressId = req.params.id; // Lấy ID địa chỉ từ URL

    if (!addressId) {
      return res.status(400).json({ status: "ERROR", message: "Thiếu ID địa chỉ." });
    }

    const response = await UserService.updateAddress(userId, addressId, req.body);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi cập nhật địa chỉ:", error);
    return res.status(500).json({ status: "ERROR", message: "Lỗi server." });
  }
};

// Xóa địa chỉ
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ middleware
    const addressId = req.params.id; // Lấy ID địa chỉ từ URL

    if (!addressId) {
      return res.status(400).json({ status: "ERROR", message: "Thiếu ID địa chỉ." });
    }

    const response = await UserService.deleteAddress(userId, addressId);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi xóa địa chỉ:", error);
    return res.status(500).json({ status: "ERROR", message: "Lỗi server." });
  }
};

// Lấy chi tiết một địa chỉ theo ID
const getDetailAddress = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ middleware
    const addressId = req.params.id; // Lấy ID địa chỉ từ URL

    if (!addressId) {
      return res.status(400).json({ status: "ERROR", message: "Thiếu ID địa chỉ." });
    }

    const response = await UserService.getDetailAddress(userId, addressId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết địa chỉ:", error);
    return res.status(500).json({ status: "ERROR", message: "Lỗi server." });
  }
};




const getAllAddresses = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ middleware
    const response = await UserService.getAllAddresses(userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi trong getAllAddresses controller:", error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi server khi lấy danh sách địa chỉ",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  userLogin,
  updateUser,
  blockUser,
  getAllUser,
  getDetailUser,
  refreshToken,
  userLogout,
  deleteManyUser,
  createAddress,
  updateAddress,
  deleteAddress,
  getAllAddresses,
  createOtp,
  completeProfile,
  checkEmail,
  checkOTP,
  updatePassword,
  getDetailAddress,
  unBlockUser,
};

// File này nằm trong controller / Folder điều khiển
// Controller chứa logic xử lý từng yêu cầu cụ thể, kiểm tra dữ liệu yêu cầu, và đưa ra phản hồi cho client.
// Controller nhận dữ liệu từ route, gọi service để thực hiện các thao tác cần thiết, và sau đó trả về kết quả.
// Giúp tách biệt giữa luồng điều khiển và xử lý logic phức tạp.

// req.body (sau khi có body-parse giúp trã giữ liệu về dạng json) => dữ liệu có sẳn ở dạng object
