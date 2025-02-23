const Admin_Fuel_Entry = require("../models/Admin_Fuel_Entry");

const getAll = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await Admin_Fuel_Entry.find();
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

// Lấy chi tiết sản phẩm
const getFuelEntryDetail = async (id) => {
  try {
    const res = await Admin_Fuel_Entry.findById(id);
    if (!res) {
      throw new Error("Fuel not found");
    }
    return { status: "Get Fuel Details Is Successfully!", res };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getAll,
  getFuelEntryDetail
};

// File services này là file dịch vụ /
// UserService này cung cấp các dịch vụ liên quan tới user.
