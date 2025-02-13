const Admin_Fuel_Entry = require("../models/Admin_Fuel_Entry");

// Hàm Get All User
const getAll = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await Admin_Fuel_Entry.find();
      console.log(res)
      return resolve({
        status: "OK",
        message: "Get All Fuel Success",
        data: res,
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getAll
};

// File services này là file dịch vụ /
// UserService này cung cấp các dịch vụ liên quan tới user.
