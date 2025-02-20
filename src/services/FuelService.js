const FuelTypes = require("../models/Fuel_Types");

const getAllFuel = async (filters) => {
    try {
      let query = { is_deleted: false };
  
      // tìm kiếm
      if (filters.search) {
        query.$or = [
          { type_name: { $regex: filters.search, $options: "i" } },
        ];
      }
  
      // filter
      if (filters.status) query.status = filters.status;

      // kết quả
      const requests = await FuelTypes.find(query)
        .sort({ createdAt: -1 });
  
      return {
        success: true,
        status: "Lấy danh sách loại nguyên liệu thành công!",
        requests,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  module.exports = {
    getAllFuel,
  };
  