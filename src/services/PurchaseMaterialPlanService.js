const Purchase_Material_Plan = require("../models/Purchase_Material_Plan");
const MaterialProvideRequest = require("../models/Material_Provide_Request");

const getAll = (options = {}, user_id = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page, limit, paginate = false } = options;
      const createdRequests = await MaterialProvideRequest.find({
        supplier_id: user_id,
      });
      const createdRequestIds = createdRequests.map(
        (request) => request.request_id
      );
      // Tạo điều kiện lọc
      const now = new Date();
      const filter = {
        status: "Đang xử lý",
        end_received: { $gt: now },
        _id: { $nin: createdRequestIds },
      };
      
      if (paginate) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
          Purchase_Material_Plan.find(filter).skip(skip).limit(limit),
          Purchase_Material_Plan.countDocuments(filter),
        ]);
        console.log("data",data);
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

      // Trường hợp không phân trang
      const res = await Purchase_Material_Plan.find(filter);
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
    const res = await Purchase_Material_Plan.findById(id);
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
