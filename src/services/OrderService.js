const FuelRequest = require("../models/Fuel_Request");
const FuelSupplyOrder = require("../models/Fuel_Supply_Order");


const getAllorderbySucess = async () => {
  try {
    const approvedOrders = await FuelRequest.find({ status: "Đã duyệt", is_deleted: false }).populate('supplier_id');
    console.log(approvedOrders)
    return {
      success: true,
      data: approvedOrders,
    };
  } catch (error) {
    throw error;
  }
};



const getAllProvideOrders = async (filters) => {
  try {
    let query = { is_deleted: false };

    if (filters.search) {
      query.$or = [
        { fuel_name: { $regex: filters.search, $options: "i" } },
        { address: { $regex: filters.search, $options: "i" } }
      ];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = Number(filters.priority);
    }

    if (filters.priceMin || filters.priceMax) {
      query.price = {};
      if (filters.priceMin) query.price.$gte = Number(filters.priceMin);
      if (filters.priceMax) query.price.$lte = Number(filters.priceMax);
    }

    if (filters.quantityMin || filters.quantityMax) {
      query.quantity = {};
      if (filters.quantityMin) query.quantity.$gte = Number(filters.quantityMin);
      if (filters.quantityMax) query.quantity.$lte = Number(filters.quantityMax);
    }

    const requests = await FuelSupplyOrder.find(query)
      .populate("supplier_id", "full_name email phone")
      .sort({ createdAt: -1 });

    return {
      status: "Lấy danh sách yêu cầu thu hàng thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { getAllorderbySucess,
  getAllProvideOrders,
 };
