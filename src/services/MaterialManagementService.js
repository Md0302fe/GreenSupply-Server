const MaterialManagement = require("../models/Material_Management");
const Materials = require('../models/Material'); // ⚠️ BẮT BUỘC PHẢI IMPORT!

const getAllFuel = async () => {
  try {
    const requests = await MaterialManagement.find()
    .populate('fuel_type_id')
    .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất trước;

    console.log("requests => ", requests)
    return {
      success: true,
      status: "Lấy danh sách loại nhiên liệu thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateFuel = async (id, data) => {
  try {
    const updatedFuel = await MaterialManagement.findByIdAndUpdate(
      id,
      { 
        type_name: data.type_name,
        description: data.description,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedFuel) {
      throw new Error("Không tìm thấy nhiên liệu!");
    }

    return {
      success: true,
      message: "Cập nhật thành công!",
      data: updatedFuel,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// ✅ Đổi deleteFuel -> cancelFuel (Chỉ đánh dấu là 'Đã xóa', không xóa khỏi DB)
const cancelFuel = async (id) => {
  try {
    const canceledFuel = await MaterialManagement.findByIdAndUpdate(
      id,
      { is_deleted: true, updatedAt: new Date() },
      { new: true }
    );

    if (!canceledFuel) {
      throw new Error("Không tìm thấy nhiên liệu!");
    }

    return {
      success: true,
      message: "Đã đánh dấu nhiên liệu là 'Đã xóa'!",
      data: canceledFuel,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


const getDashboardSummary = async () => {
  try {
    const totalFuelTypes = await MaterialManagement.countDocuments();
    const totalFuelQuantity = await MaterialManagement.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }]);

    return {
      success: true,
      totalFuelTypes,
      totalFuelQuantity: totalFuelQuantity.length ? totalFuelQuantity[0].total : 0,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getFuelTypesOverview = async () => {
  try {
    const fuelData = await MaterialManagement.find().populate("fuel_type_id");
    
    const formattedData = fuelData.map((item) => ({
      type: item.fuel_type_id?.type_name || "???", 
      value: item.quantity || 0, // ✅ Nếu thiếu thì hiển thị 0
    }));

    return { success: true, fuelData: formattedData };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getFuelHistory = async () => {
  try {
    // Lấy dữ liệu từ cơ sở dữ liệu và sắp xếp theo updatedAt
    const history = await MaterialManagement.find()
      .populate("fuel_type_id")
      .sort({ updatedAt: -1 }) 
      .limit(50);  
    return {
      success: true,
      history: history.map(entry => ({
        type: entry.fuel_type_id?.type_name || "Không xác định",
        action: entry.quantity >= 0 ? "Nhập kho" : "Xuất kho",
        quantity: Math.abs(entry.quantity),
        timestamp: entry.updatedAt || new Date()
      }))
    };
  } catch (error) {
    throw new Error(error.message);
  }
};



const getLowStockAlerts = async () => {
  try {
    const lowStock = await MaterialManagement.find({ quantity: { $lt: 1000 } }).populate("fuel_type_id");
    return {
      success: true,
      lowStock: lowStock.map(stock => ({
        fuel_type: stock.fuel_type_id?.type_name || "Không xác định",
        quantity: stock.quantity || 0,
        warning: stock.quantity === 0 ? "Hết nhiên liệu!" : "Sắp hết nhiên liệu!"
      }))
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = { getAllFuel,
   updateFuel, 
   getDashboardSummary,
   getFuelTypesOverview,
   getFuelHistory,
   getLowStockAlerts,
   cancelFuel, };
