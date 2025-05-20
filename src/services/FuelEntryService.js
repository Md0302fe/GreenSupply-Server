const Admin_Fuel_Entry = require("../models/Admin_Fuel_Entry");

const getAll = (options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page, limit, paginate = false } = options;

      if (paginate) {
        const skip = (page - 1) * limit;
        const filter = { status: "Đang xử lý" }; // thêm điều kiện lọc
        const [data, total] = await Promise.all([
          Admin_Fuel_Entry.find(filter).skip(skip).limit(limit),
          Admin_Fuel_Entry.countDocuments(filter),
        ]);

        return resolve({
          status: "OK",
          message: "Get Paginated Fuel Success",
          data,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        });
      }

      // Mặc định: lấy toàn bộ như cũ
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
  getFuelEntryDetail,
};

// File services này là file dịch vụ /
// UserService này cung cấp các dịch vụ liên quan tới user.
