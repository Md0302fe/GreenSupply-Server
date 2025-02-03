const User = require("../models/UserModel");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");
const UserAddress = require("../models/UserAdress");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const otpStorage = new Map();
const { OAuth2Client } = require("google-auth-library"); // Thư viện Google OAuth
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
const sendOtpEmailForgotPassword = async (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra email đã tồn tại
      const existedEmail = await User.findOne({
        email: email,
      });

      if (existedEmail == null) {
        return resolve({
          status: "ERROR",
          message: `Email ${existedEmail.email} không tồn tại!`,
        });
      }

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
const checkEmailForgot = async (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra email đã tồn tại
      const existedEmail = await User.findOne({
        email: email,
      });

      if (existedEmail == null) {
        return resolve({
          status: "ERROR",
          message: `Email ${existedEmail.email} không tồn tại!`,
        });
      }
      const result = await sendOtpEmailForgotPassword(email);
      resolve(result);
    } catch (error) {
      console.error("Lỗi khi kiểm tra email:", error);

      // Trả về lỗi
      return reject({
        status: "ERROR",
        message: "Không thể kiểm tra email. Vui lòng thử lại sau.",
        error: error.message,
      });
    }
  });
};

const updatePassword = async (newPassword, email) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra email có tồn tại không
      const existedEmail = await User.findOne({ email: email });

      if (!existedEmail) {
        return resolve({
          status: "ERROR",
          message: "Email không tồn tại!",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Cập nhật mật khẩu trong database
      await User.updateOne({ email: email }, { password: hashedPassword });

      return resolve({
        status: "OK",
        message: "Mật khẩu đã được cập nhật thành công!",
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật mật khẩu:", error);
      return reject({
        status: "ERROR",
        message: "Không thể cập nhật mật khẩu. Vui lòng thử lại sau.",
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
        googleId: null,
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

// Hàm tạo 1 user mới
const completeProfile = (newUser) => {

  return new Promise(async (resolve, reject) => {
    const { full_name, email, phone, role_check = false, birth_day, googleId } = newUser;
    try {
      // truy vấn role
      const roleName = role_check ? "Supplier" : "User";
      const role = await Role.findOne({ role_name: roleName });
      if (!role) {
        return {
          status: "ERROR",
          message: `Không tìm thấy vai trò mặc định '${roleName}'.`,
        };
      }
      console.log(newUser)
      const createdUser = await User.create({
        full_name,
        email,
        phone,
        password: null,
        role_id: role._id,
        birth_day: birth_day ? new Date(birth_day) : null,
        googleId
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
    const { email, password, googleToken } = userLogin; // Thêm googleToken vào input

    try {
      // Trường hợp đăng nhập bằng Google
      if (googleToken) {
        // 1. Xác thực token Google
        const ticket = await client.verifyIdToken({
          idToken: googleToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload(); // Thông tin người dùng Google
        const { email, name, picture, sub: googleId } = payload;
        // 2. Kiểm tra xem người dùng đã tồn tại chưa
        let user = await User.findOne({ email });

        if (!user) {
          return resolve({
            status: "NEW_USER",
            message: "Người dùng cần cập nhật thông tin bổ sung",
            user: {
              email: email,
              full_name: name,
              avatar: picture,
              googleId
            },
          });
        }

        // 4. Tạo access_token và refresh_token
        const access_token = await genneralAccessToken({
          id: user.id,
          isAdmin: user.isAdmin,
        });
        const refresh_token = await genneralRefreshToken({
          id: user.id,
          isAdmin: user.isAdmin,
        });
        // 5. Trả về thông tin đăng nhập
        return resolve({
          status: "OK",
          message: "Đăng nhập Google thành công",
          access_token,
          refresh_token,
          user: {
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        });
      }

      // Trường hợp đăng nhập bằng email và password
      if (email && password) {
        // Tìm user trong hệ thống thông qua email
        const user = await User.findOne({ email });

        if (user === null) {
          return resolve({
            status: "ERROR",
            message: `Tài khoản không tồn tại`,
          });
        }

        // So sánh password
        const comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
          return resolve({
            status: "ERROR",
            message: "Sai tài khoản hoặc mật khẩu !",
          });
        } else {
          // Tạo token khi đăng nhập thành công
          const access_token = await genneralAccessToken({
            id: user.id,
            isAdmin: user.isAdmin,
          });
          const refresh_token = await genneralRefreshToken({
            id: user.id,
            isAdmin: user.isAdmin,
          });

          return resolve({
            status: "OK",
            message: "Đăng nhập thành công",
            access_token,
            refresh_token,
          });
        }
      }

      // Nếu không có thông tin đăng nhập nào được cung cấp
      return resolve({
        status: "ERROR",
        message: "Vui lòng cung cấp thông tin đăng nhập",
      });
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
// tạo địa chỉ
const createAddress = async (data) => {
  try {
    const { user_id, full_name, company_name, address, phone, note } = data;

    if (!user_id || !full_name || !address || !phone) {
      return { status: "ERROR", message: "Thiếu thông tin bắt buộc." };
    }

    const newAddress = new UserAddress({ user_id, full_name, company_name, address, phone, note });
    const savedAddress = await newAddress.save();

    return { status: "OK", message: "Tạo địa chỉ thành công.", data: savedAddress };
  } catch (error) {
    console.error("Error in createAddress:", error);
    return { status: "ERROR", message: "Lỗi khi tạo địa chỉ." };
  }
};

// Cập nhật địa chỉ
const updateAddress = async (id, data) => {
  try {
    const updatedAddress = await UserAddress.findByIdAndUpdate(id, data, { new: true });

    if (!updatedAddress) {
      return { status: "ERROR", message: "Không tìm thấy địa chỉ." };
    }

    return { status: "OK", message: "Cập nhật địa chỉ thành công.", data: updatedAddress };
  } catch (error) {
    console.error("Error in updateAddress:", error);
    return { status: "ERROR", message: "Lỗi khi cập nhật địa chỉ." };
  }
};

// Xóa địa chỉ
const deleteAddress = async (id) => {
  try {
    const deletedAddress = await UserAddress.findByIdAndUpdate(id, { is_deleted: true }, { new: true });

    if (!deletedAddress) {
      return { status: "ERROR", message: "Không tìm thấy địa chỉ." };
    }

    return { status: "OK", message: "Xóa địa chỉ thành công.", data: deletedAddress };
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    return { status: "ERROR", message: "Lỗi khi xóa địa chỉ." };
  }
};

// xem tất tả địa chỉ
const getAllAddresses = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const addresses = await UserAddress.find({ is_deleted: false }); // Lấy các địa chỉ chưa bị xóa
      resolve({
        status: "OK",
        message: "Get all addresses successfully",
        data: addresses,
      });
    } catch (error) {
      console.error("Error in getAllAddresses service:", error.message);
      reject({
        status: "ERROR",
        message: "Failed to get all addresses",
        error: error.message,
      });
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
  createAddress,
  updateAddress,
  deleteAddress,
  getAllAddresses,
  sendOtpEmail,
  completeProfile,
  checkEmailForgot,
  verifyOtp,
  updatePassword,
};

// File services này là file dịch vụ /
// UserService này cung cấp các dịch vụ liên quan tới user.
