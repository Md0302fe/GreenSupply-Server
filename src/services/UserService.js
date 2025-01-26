const User = require("../models/UserModel");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const otpStorage = new Map();

const {
  genneralAccessToken,
  genneralRefreshToken,
} = require("../services/JwtService");

// Tạo mã otp
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // Tạo mã OTP ngẫu nhiên từ 100000 -> 999999
};

const sendOtpEmail = async (email, phone) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra email đã tồn tại
      const existedEmail = await User.findOne({
        email: email,
      });

      if (existedEmail != null) {
        return resolve({
          status: "ERROR",
          message: `Email ${existedEmail.email} đã được sử dụng!`,
        });
      }
      // Kiểm tra phone đã tồn tại
      const existedPhone = await User.findOne({
        phone: phone,
      });

      if (existedPhone != null) {
        return resolve({
          status: "ERROR",
          message: `Số điện thoại ${existedPhone.phone} đã được sử dụng!`,
        });
      }

      // Cấu hình transporter của nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail", // Sử dụng dịch vụ email, ví dụ Gmail
        auth: {
          user: process.env.EMAIL_USERNAME, // Email gửi
          pass: process.env.EMAIL_PASSWORD, // Mật khẩu email (hoặc App Password)
        },
      });

      // Tạo mã OTP
      const otp = generateOTP(); // Hàm generateOTP() tạo mã OTP

      // Nội dung email
      const mailOptions = {
        from: process.env.EMAIL_USERNAME, // Địa chỉ email gửi
        to: email, // Email người nhận
        subject: "Mã OTP của bạn",
        text: `Xin chào,\n\nMã OTP của bạn là: ${otp}.\n\nMã này có hiệu lực trong vòng 5 phút.\n\nTrân trọng, \nĐội ngũ hỗ trợ`,
      };

      // Gửi email
      await transporter.sendMail(mailOptions);
      // Lưu OTP vào Map với thời gian sống 5 phút
      otpStorage.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

      // Trả về OTP cùng trạng thái thành công
      return resolve({
        status: "OK",
        message: "OTP đã được gửi thành công!",
      });
    } catch (error) {
      console.error("Lỗi khi gửi OTP qua email:", error);

      // Trả về lỗi
      return reject({
        status: "ERROR",
        message: "Không thể gửi OTP. Vui lòng thử lại sau.",
        error: error.message,
      });
    }
  });
};

const verifyOtp = async (email, otp) => {
  const storedOtp = otpStorage.get(email);
  if (!storedOtp || storedOtp.expiresAt < Date.now()) {
    return {
      status: "ERROR",
      message: "OTP đã hết hạn hoặc không tồn tại.",
    };
  }

  if (storedOtp.otp !== otp) {
    return {
      status: "ERROR",
      message: "OTP không chính xác.",
    };
  }

  // Xóa OTP sau khi xác minh thành công
  otpStorage.delete(email);

  return {
    status: "OK",
    message: "OTP đã được xác minh thành công.",
  };
};


// Hàm tạo 1 user mới
const createUser = (newUser) => {

  return new Promise(async (resolve, reject) => {
    const { name, email, password, phone, role_check = false, birth_day, otp } = newUser;
    try {
      // check otp
      const verifyOtpResult = await verifyOtp(email, otp);
      if (verifyOtpResult.status !== "OK") {
        return resolve({
          status: "ERROR",
          message: verifyOtpResult.message, // Lấy thông báo lỗi từ verifyOtp
        });
      }

      // truy vấn role
      const roleName = role_check ? "Supplier" : "User";
      const role = await Role.findOne({ role_name: roleName });
      if (!role) {
        return {
          status: "ERROR",
          message: `Không tìm thấy vai trò mặc định '${roleName}'.`,
        };
      }
      //  Mã hóa dữ liệu password
      const hash = bcrypt.hashSync(password, 10);

      const createdUser = await User.create({
        full_name: name,
        email,
        phone,
        password: hash,
        role_id: role._id,
        birth_day: birth_day ? new Date(birth_day) : null,
      });
      if (createdUser) {
        return resolve({
          status: "OK",
          message: "Tạo tài khoản thành công",
          data: createdUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Hàm Handle Login User
const userLogin = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      // Tìm user trong hệ thống thông qua (email) / tìm email -> đợi -> dùng await
      const user = await User.findOne({
        email: email,
      });
      // Nếu user không tồn tại trong hệ thống
      if (user === null) {
        return resolve({
          status: "ERROR",
          message: `Tài khoảng không tồn tại`,
        });
      }
      // So sánh 2 passowrd (password người dùng nhập, password tồn tại trên hệ thống)
      const comparePassword = bcrypt.compareSync(password, user.password);
      // Nếu 2 pass không giống nhau -> res message đến người dùng
      if (!comparePassword) {
        return resolve({
          status: "ERROR",
          message: "Sai tài khoản hoặc mật khẩu !",
        });
      } else {
        // Ngược lại 2 pass = nhau -> res message Successl , tạo token lưu trữ data user.
        const access_token = await genneralAccessToken({
          id: user.id,
          isAdmin: user.isAdmin,
        });
        const refresh_token = await genneralRefreshToken({
          id: user.id,
          isAdmin: user.isAdmin,
        });
        // đăng nhập thành công trả về 1 object chứa 2 token.
        return resolve({
          status: "OK",
          message: "Đăng nhập thành công",
          access_token,
          refresh_token,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Hàm Update User
const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm id trong hệ thống thông qua (_id) / tìm id -> đợi -> dùng await
      const user = await User.findOne({ _id: id });
      // Nếu user không tồn tại trong hệ thống
      if (user === null) {
        return resolve({
          status: "OK",
          message: `Cập nhật người dùng thất bại`,
        });
      }

      // gọi và update user by id + data cần update , nếu muốn trả về object mới cập nhật thì cần thêm {new:true}
      const updateUser = await User.findByIdAndUpdate(id, data, { new: true });
      return resolve({
        status: "OK",
        message: "Cập nhật người dùng thành công",
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Hàm Delete User
const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm user(object) trong hệ thống thông qua (_id) / tìm id -> đợi -> dùng await
      const user = await User.findOne({ _id: id });
      // Nếu user không tồn tại trong hệ thống
      if (user === null) {
        return resolve({
          status: "OK",
          message: `User is not defined !`,
        });
      }
      // gọi và delete user by id
      const deleteUser = await User.findByIdAndDelete(id);
      return resolve({
        status: "OK",
        message: "Xóa tài khoản thành công",
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Hàm Delete Many User
const deleteManyUser = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      // gọi và delete user by id
      await User.deleteMany({ _id: ids });
      return resolve({
        status: "OK",
        message: "Xóa danh sách tài khoản thành công",
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Hàm Get All User
const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find();
      return resolve({
        status: "OK",
        message: "Get All User Success",
        data: allUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Hàm Get Detail User
const getDetailUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        _id: id,
      });
      if (user === null) {
        return resolve({
          status: "OK",
          message: "The user is not defined !",
        });
      }
      return resolve({
        status: "OK",
        message: "Get User Success",
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createUser,
  userLogin,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  deleteManyUser,
  sendOtpEmail
};

// File services này là file dịch vụ /
// UserService này cung cấp các dịch vụ liên quan tới user.
