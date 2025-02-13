const FuelRequest = require("../models/Fuel_Request");


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

module.exports = { getAllorderbySucess };
