const ProductionRequest = require("../models/Production_Request");
const ProductionProcessing = require("../models/Production_Processing");
const ProcessStatus = require("../models/Process_Status ");

const create = async (dataRequest) => {
  try {
    const {
      production_request_id,
      start_time,
      end_time,
      note,
      user_id
    } = dataRequest;

    // 1️⃣ Tìm `ProductionRequest` để lấy `request_name`
    const productionRequest = await ProductionRequest.findById(production_request_id);
    if (!productionRequest) {
      throw new Error("Không tìm thấy yêu cầu sản xuất!");
    }

    // 2️⃣ Tạo mới một bản ghi sản xuất
    const newProduction = new ProductionProcessing({
      production_request_id,
      production_name: productionRequest.request_name, // Lấy tên từ yêu cầu sản xuất
      start_time,
      end_time,
      note,
      user_id,
    });

    // 3️⃣ Lưu vào DB
    const savedProduction = await newProduction.save();

    // 4️⃣ Cập nhật trạng thái của `ProductionRequest` thành `"Đang sản xuất"`
    await ProductionRequest.findByIdAndUpdate(
      production_request_id,
      { status: "Đang sản xuất" },
      { new: true }
    );

    return savedProduction;
  } catch (error) {
    console.error("Lỗi khi tạo quy trình sản xuất:", error);
    throw new Error("Không thể tạo quy trình sản xuất");
  }
};


const getAll = async (filters) => {
  try {
    let query = {};

    // Tìm kiếm theo status nếu có
    if (filters.status) {
      query.status = filters.status;
    }

    // Tìm kiếm theo ID yêu cầu sản xuất
    if (filters.production_request_id) {
      query.production_request_id = filters.production_request_id;
    }

    // Tìm kiếm theo khoảng thời gian
    if (filters.start_date && filters.end_date) {
      query.start_time = {
        $gte: new Date(filters.start_date),
        $lte: new Date(filters.end_date),
      };
    }

    // Thêm bộ lọc tìm kiếm chung (searchText)
    if (filters.searchText) {
      query.$or = [
        { status: { $regex: filters.searchText, $options: "i" } },
        { note: { $regex: filters.searchText, $options: "i" } },
      ];
    }

    // Sắp xếp theo query
    let sortQuery = { createdAt: -1 }; // Mặc định sắp xếp theo ngày tạo mới nhất
    if (filters.sortField && filters.sortOrder) {
      sortQuery = { [filters.sortField]: filters.sortOrder === "ascend" ? 1 : -1 };
    }

    // Lấy danh sách theo điều kiện lọc
    const requests = await ProductionProcessing.find(query)
      .sort(sortQuery)
      .populate("production_request_id user_id");

    return {
      success: true,
      message: "Lấy danh sách quy trình sản xuất thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const update = async (id, data) => {
  try {
    const updated = await ProductionProcessing.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      throw new Error("Không tìm thấy quy trình sản xuất!");
    }

    return {
      success: true,
      message: "Cập nhật thành công!",
      data: updated,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteById = async (id) => {
  try {
    // 1. Tìm đơn sản xuất theo id
    const deleted = await ProductionProcessing.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Không tìm thấy đơn sản xuất!");
    }

    return {
      success: true,
      message: "Đã xóa đơn sản xuất và cộng lại số lượng nhiên liệu thành công!",
      data: deleted,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const changeStatus = async (id) => {
  try {
    // 1. Tìm đơn sản xuất theo id
    const productionProcessing = await ProductionProcessing.findById(id);
    if (!productionProcessing) {
      return {
        success: false,
        message: "Không tìm thấy đơn sản xuất!",
      };
    }

    // 2. Đổi trạng thái ProductionProcessing thành "Đang sản xuất"
    productionProcessing.status = "Đang sản xuất";
    productionProcessing.process_stage1_start = new Date();
    await productionProcessing.save();

    // 3. Tạo ProcessStatus mới
    const newProcessStatus = new ProcessStatus({
      process_id: productionProcessing._id,
    });

    await newProcessStatus.save();

    return {
      success: true,
      message: "Đã duyệt đơn thành công và tạo ProcessStatus!",
      data: {
        productionProcessing,
        processStatus: newProcessStatus,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = {
  create,
  getAll,
  update,
  deleteById,
  changeStatus,
};
