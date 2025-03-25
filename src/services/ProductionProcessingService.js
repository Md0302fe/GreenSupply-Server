const ProductionRequest = require("../models/Production_Request");
const ProductionProcessing = require("../models/Production_Processing");
const ProcessStatus = require("../models/Process_Status ");
const { default: mongoose } = require("mongoose");
const ProductionProcessHistory = require("../models/Production_Process_History");

// stage Name
const stageMap = {
  1: "Phân loại nguyên liệu",
  2: "Rửa và làm sạch",
  3: "Khử trùng/diệt khuẩn bề mặt",
  4: "Phủ màng sinh học & làm khô",
  5: "Ủ chín (kiểm soát nhiệt độ/độ ẩm)",
  6: "Đóng gói thành phẩm",
  7: "Ghi nhãn & truy xuất nguồn gốc",
  8: "Bảo quản lạnh",
};

// start stage
const processStartCurrentMap = {
  1: "process_stage1_start",
  2: "process_stage2_start",
  3: "process_stage3_start",
  4: "process_stage4_start",
  5: "process_stage5_start",
  6: "process_stage6_start",
  7: "process_stage7_start",
  8: "process_stage8_start",
};

// end stage
const processEndCurrentMap = {
  1: "process_stage1_end",
  2: "process_stage2_end",
  3: "process_stage3_end",
  4: "process_stage4_end",
  5: "process_stage5_end",
  6: "process_stage6_end",
  7: "process_stage7_end",
};

const create = async (dataRequest) => {
  try {
    const { production_request_id, start_time, end_time, note, user_id } =
      dataRequest;

    // 1️⃣ Tìm `ProductionRequest` để lấy `request_name`
    const productionRequest = await ProductionRequest.findById(
      production_request_id
    );
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
      sortQuery = {
        [filters.sortField]: filters.sortOrder === "ascend" ? 1 : -1,
      };
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

// Get danh sách đang sảng xuất của hệ thống
const getAllExecuteProcess = async () => {
  try {
    // Lấy danh sách theo điều kiện lọc
    const requests = await ProductionProcessing.find({
      status: "Đang sản xuất",
    }).populate("production_request_id user_id");

    return {
      success: true,
      message: "Get All Execute Process Success!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get All Histories Process
const getAllHistoriesProcess = async () => {
  try {
    const requests = await ProductionProcessHistory.find().populate(
      "production_process"
    );

    return {
      success: true,
      message: "Get All Histories Process Success!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update infomation data
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

// Cập nhật quy trình sản xuất khi hoàng thành 7 giai đoạn
const completeProductionProcess = async (process_id) => {
  try {
    // 1 : update Production Process Status and final_time_finish
    const productionProcessing = await ProductionProcessing.findById(
      process_id
    );

    if (!productionProcessing) {
      return {
        success: false,
        message: "Không tìm thấy đơn sản xuất!",
      };
    }
    const date = new Date();
    productionProcessing.status = "Hoàn thành";
    productionProcessing.final_time_finish = date;
    await productionProcessing.save();

    const objectProcessId = new mongoose.Types.ObjectId(process_id);

    // 2 : create record history for this production process
    const createdHistory = await ProductionProcessHistory.create({
      production_process: objectProcessId,
    });

    if (!createdHistory) {
      return {
        success: false,
        message: "Không thể tạo lịch sử cho quy trình này",
      };
    }

    return {
      success: true,
      message: "Đã hoàn thành toàn bộ quy trình!",
    };
  } catch (error) {
    console.log("Error At Services -> completeProductionProcess : ", error);
    return {
      success: false,
      message: "Cập nhật quy trình bị gián đoạn do sự cố => " + error.message,
    };
  }
};

// Cập nhật trạng thái stage và tạo quy trình mới
const finishStage = async (process_id, noStage, stage_id, data = {}) => {
  try {
    const currentDate = new Date();
    // Cập nhật stage hiện tại
    const stageUpdated = await ProcessStatus.findByIdAndUpdate(
      stage_id,
      { ...data, status: "Hoàn thành", end_time: currentDate },
      { new: true }
    );

    if (!stageUpdated) {
      return {
        success: false,
        message: "Không tìm thấy stage_id",
        data: null,
      };
    }
    // Nếu stage hiện tại không phải cuối cùng → tạo stage tiếp theo
    if (noStage <= 6) {
      await createNextStage(process_id, parseInt(noStage) + 1);
    }

    if (noStage == 7) {
      console.log("noStage => ", noStage);
      const result = await completeProductionProcess(process_id);
      if (!result.success) return result;
    }
    return {
      success: true,
      message: "Cập nhật thành công!",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Hàm tạo stage mới
const createNextStage = async (process_id, noStage) => {
  // Map tới Name của quy trình tiếp theo
  const nextStageName = stageMap[noStage];
  // Map tới currentStage của quy trình tổng
  const process_stage_start = processStartCurrentMap[noStage];
  // Map tới endCurrentStage của quy trình tổng
  const process_stage_end = processEndCurrentMap[noStage - 1];

  if (!nextStageName || !process_stage_start || !process_stage_end) return;

  // tìm productionProcessing
  const productionProcessing = await ProductionProcessing.findById(process_id);
  if (!productionProcessing) return;

  // Tăng stage hiện tại lên
  productionProcessing.current_stage += 1;

  const currentDate = new Date();

  // Cập nhật start & end time thông qua ánh xạ key
  productionProcessing[process_stage_start] = currentDate;
  productionProcessing[process_stage_end] = currentDate;

  await productionProcessing.save();

  const newStage = new ProcessStatus({
    process_id,
    stage_name: nextStageName,
    start_time: new Date(),
  });

  await newStage.save();
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
      message:
        "Đã xóa đơn sản xuất và cộng lại số lượng nhiên liệu thành công!",
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
    // Cập nhật current lên 1
    productionProcessing.current_stage = productionProcessing.current_stage + 1;
    productionProcessing.process_stage1_start = new Date();
    await productionProcessing.save();

    // 3. Tạo Process Stage 1
    const newProcessStatus = new ProcessStatus({
      process_id: productionProcessing._id,
      stage_name: "Phân loại nguyên liệu",
      start_time: new Date(),
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

// get Processing Details
const getProcessingDetails = async (id) => {
  try {
    // Lấy danh sách theo điều kiện lọc
    const requests = await ProductionProcessing.findById(id).populate(
      "production_request_id user_id"
    );

    return {
      success: true,
      message: "Get ProductionProcessing details successfully!",
      data: requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// get Processing Details
const getProcessStage = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid process_id format (id is not an ObjectId)");
    }
    const objectId = new mongoose.Types.ObjectId(id);

    // Lấy danh sách theo điều kiện lọc : objectId = id
    const requests = await ProcessStatus.find({
      process_id: objectId,
    }).populate("process_id");

    return {
      success: true,
      message: "Get Process Stage details successfully!",
      data: requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

//////Dashboard processing

const getDashboardprocess = async () => {
  try {
    // Đếm số lượng theo trạng thái
    const waitingCount = await ProductionProcessing.countDocuments({
      status: "Chờ duyệt",
    });
    const processingCount = await ProductionProcessing.countDocuments({
      status: "Đang sản xuất",
    });
    const doneCount = await ProductionProcessing.countDocuments({
      status: "Hoàn thành",
    });

    // Có thể thêm biểu đồ ở đây sau
    return {
      waiting: waitingCount,
      processing: processingCount,
      done: doneCount,
    };
  } catch (error) {
    throw new Error("Lỗi khi thống kê dashboard: " + error.message);
  }
};

module.exports = {
  create,
  getAll,
  update,
  deleteById,
  changeStatus,
  getProcessingDetails,
  getProcessStage,
  getAllExecuteProcess,
  finishStage,
  getDashboardprocess,
  getAllHistoriesProcess,
};
