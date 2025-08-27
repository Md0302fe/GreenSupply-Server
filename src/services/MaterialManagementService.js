const MaterialManagement = require("../models/Material_Management");
const Materials = require("../models/Material"); // ⚠️ BẮT BUỘC PHẢI IMPORT!
const Box = require("../models/Package_Material");
const BoxCategory = require("../models/Package_Material_Categorie");
const storage_id = "665480f9bde459d62ca7d001";

const getAllFuel = async () => {
  try {
    const requests = await MaterialManagement.find()
      .populate("fuel_type_id")
      .populate("storage_id")
      .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo mới nhất trước;

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
    console.log("id" ,id )
    console.log("data" ,data )
    const updatedFuel = await MaterialManagement.findByIdAndUpdate(
      id,
      {
        type_name: data.type_name,
        description: data.description,
        quantity: data.quantity,
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
    // get material in material management
    const fuel_type_id = canceledFuel?.fuel_type_id?._id;

    const updateDeleteMaterial = await Materials?.findByIdAndUpdate(
      fuel_type_id,
      { is_deleted: true, updatedAt: new Date() },
      { new: true }
    )

    console.log("updateDeleteMaterial ==> ", updateDeleteMaterial)

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

// Undo Cancel Fuel
// ✅ Đổi deleteFuel -> cancelFuel (Chỉ đánh dấu là 'Đã xóa', không xóa khỏi DB)
const UndoCancelFuel = async (id) => {
  try {
    const canceledFuel = await MaterialManagement.findByIdAndUpdate(
      id,
      { is_deleted: true, updatedAt: new Date() },
      { new: true }
    );
    // get material in material management
    const fuel_type_id = canceledFuel?.fuel_type_id?._id;

    const updateDeleteMaterial = await Materials?.findByIdAndUpdate(
      fuel_type_id,
      { is_deleted: false, updatedAt: new Date() },
      { new: true }
    )

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

const createFuel = async (data) => {
  try {
    // Kiểm tra xem tên loại nhiên liệu đã tồn tại chưa
    const existing = await Materials.findOne({
      type_name: { $regex: new RegExp(`^${data.type_name.trim()}$`, "i") },
    });

    if (existing) {
      const error = new Error("Tên loại nhiên liệu đã tồn tại!");
      error.code = "DUPLICATE_NAME";
      throw error;
    }

    // Tạo mới nguyên liệu trong bảng Materials
    const newFuelType = new Materials({
      type_name: data.type_name,
      description: data.description || "Không có mô tả",
      image: data.image_url || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedFuelType = await newFuelType.save();

    const newMaterialManagementRecord = new MaterialManagement({
      fuel_type_id: savedFuelType._id,
      quantity: 0,
      storage_id: storage_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newMaterialManagementRecord.save();

    return {
      success: true,
      message:
        "Tạo loại nhiên liệu mới thành công và khởi tạo quản lý nguyên liệu!",
      data: savedFuelType,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getDashboardSummary = async () => {
  try {
    // ====== FUEL ======
    const totalFuelTypes = await Materials.countDocuments({
      is_deleted: false,
    });

    const totalFuelQuantityResult = await MaterialManagement.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const totalFuelQuantity = totalFuelQuantityResult[0]?.total || 0;

    // ====== BOX CATEGORY ======
    const allBoxCategories = await BoxCategory.find().lean();
    const activeBoxCategories = allBoxCategories.filter(
      (cat) => !cat.is_delete
    );
    const inactiveBoxCategories = allBoxCategories.filter(
      (cat) => cat.is_delete
    );

    const totalBoxCategories = allBoxCategories.length;
    const activeCount = activeBoxCategories.length;
    const inactiveCount = inactiveBoxCategories.length;

    const validForStat = activeBoxCategories.filter(
      (cat) => typeof cat.quantity === "number"
    );

    const maxStockBoxCategory = validForStat.reduce(
      (a, b) => (a.quantity > b.quantity ? a : b),
      validForStat[0] || null
    );

    const minCandidates = validForStat.filter((cat) => cat.quantity > 0);
    const minStockBoxCategory = minCandidates.length
      ? minCandidates.reduce((a, b) => (a.quantity < b.quantity ? a : b))
      : null;

    // ====== TYPE BREAKDOWN: túi/thùng ======
    const boxList = await Box.find({ is_delete: false }).lean();

    const typeStats = {
      "túi chân không": 0,
      "thùng carton": 0,
    };

    for (const box of boxList) {
      if (box.type in typeStats) {
        typeStats[box.type] += box.quantity || 0;
      }
    }

    return {
      success: true,
      fuel: {
        totalFuelTypes,
        totalFuelQuantity,
      },
      boxCategory: {
        totalBoxCategories, //  Tổng loại
        activeBoxCategories: activeCount, //  Đang hoạt động
        inactiveBoxCategories: inactiveCount, //  Đã ngừng
        maxStockBoxCategory: maxStockBoxCategory
          ? {
              name: maxStockBoxCategory.categories_name,
              quantity: maxStockBoxCategory.quantity,
            }
          : null,
        minStockBoxCategory: minStockBoxCategory
          ? {
              name: minStockBoxCategory.categories_name,
              quantity: minStockBoxCategory.quantity,
            }
          : null,
        typeBreakdown: typeStats, // ✅ Tổng số túi và thùng đang có
      },
    };
  } catch (error) {
    throw new Error("Lỗi khi lấy dashboard summary: " + error.message);
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
      history: history.map((entry) => ({
        type: entry.fuel_type_id?.type_name || "Không xác định",
        action: entry.quantity >= 0 ? "Nhập kho" : "Xuất kho",
        quantity: Math.abs(entry.quantity),
        timestamp: entry.updatedAt || new Date(),
      })),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getLowStockAlerts = async () => {
  try {
    const lowStock = await MaterialManagement.find({
      quantity: { $lt: 1000 },
    }).populate("fuel_type_id");
    return {
      success: true,
      lowStock: lowStock.map((stock) => ({
        fuel_type: stock.fuel_type_id?.type_name || "Không xác định",
        quantity: stock.quantity || 0,
        warning:
          stock.quantity === 0 ? "Hết nhiên liệu!" : "Sắp hết nhiên liệu!",
      })),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getAllFuel,
  updateFuel,
  UndoCancelFuel,
  getDashboardSummary,
  getFuelTypesOverview,
  getFuelHistory,
  getLowStockAlerts,
  cancelFuel,
  createFuel,
};
