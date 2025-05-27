const Material = require("../models/Material");

const getAllFuel = async (filters) => {
  try {
    let query = { is_deleted: false };

    // Tìm kiếm
    if (filters.search) {
      query.$or = [{ type_name: { $regex: filters.search, $options: "i" } }];
    }

    // Filter
    if (filters.status) query.status = filters.status;

    // Kết quả
    const requests = await Material.find(query).sort({ createdAt: -1 });

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
    const updatedFuel = await Material.findByIdAndUpdate(
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
    const canceledFuel = await Material.findByIdAndUpdate(
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

module.exports = { getAllFuel, updateFuel, cancelFuel };
