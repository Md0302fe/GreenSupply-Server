const Product = require("../models/Products");
const ProcessStatus = require("../models/Process_Status ");
const StoreReceipt = require("../models/Storage_Receipt.js");
const ProductionRequest = require("../models/Production_Request");
const SingleProductionProcessing = require("../models/Single_Process");
const ProductionProcessHistory = require("../models/Production_Process_History");
const ConsolidateProductionProcessing = require("../models/Consolidated_Process");

const product_img_carton = "/assets/product-image/prouct_carton_img.jpg";

const Notifications = require("../models/Notifications.js");
const socket = require("../socket.js");
const mongoose = require("mongoose");

const admin_role_id = new mongoose.Types.ObjectId("67950da386a0a462d408c7b9");
const material_mng_role_id = new mongoose.Types.ObjectId(
  "686f3835d7eaed8a9fd5a8b8"
);
const warehouse_mng_role_id = new mongoose.Types.ObjectId(
  "686f3835d7eaed8a9fd5a8b7"
);
const process_mng_role_id = new mongoose.Types.ObjectId(
  "686f3835d7eaed8a9fd5a8b6"
);

// Convert Date To String
const convertDateStringV1 = (dateString) => {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Chỉ lấy ngày-tháng-năm
  } catch (error) {
    console.log("Lỗi trong quá trình convert thời gian: ", error);
    return ""; // Tránh lỗi hiển thị nếu có lỗi
  }
};

// hard code wait for function create & update store
const store_product_id = "6855623993433942fba4962e";

// stage Name
const stageMap = {
  1: "Phân loại nguyên liệu",
  2: "Rửa – gọt vỏ - tách hạt – cắt lát",
  3: "Chần để ức chế enzyme",
  4: "Điều vị (ngâm đường/muối)",
  5: "Sấy (máy sấy lạnh hoặc đối lưu)",
  6: "Làm nguội – đóng gói – dán nhãn",
  7: "Bảo quản lạnh",
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

function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng tính từ 0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

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
    const newProduction = new SingleProductionProcessing({
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

// consolidate create process

const createConsolidateProcess = async (dataRequest) => {
  try {
    const {
      production_request_id,
      start_time,
      end_time,
      note,
      user_id,
      total_raw_material,
      total_finish_product,
      total_loss_percentage,
    } = dataRequest;

    // convert array in to array objectId
    const productionRequestObjectId = production_request_id.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // 1. Tạo mới một bản ghi sản xuất
    const newConsolidateProduction = new ConsolidateProductionProcessing({
      production_request_id: productionRequestObjectId,
      production_name: "Quy trình sản xuất tổng hợp",
      total_raw_material,
      total_finish_product,
      total_loss_percentage,
      start_time,
      end_time,
      note,
      user_id,
    });

    // 2. Lưu vào DB
    const savedProduction = await newConsolidateProduction.save();

    // 3. Cập nhật trạng thái của `ProductionRequest` thành `"Đang sản xuất"`
    await ProductionRequest.updateMany(
      { _id: { $in: production_request_id } }, // production_request_id là mảng
      { status: "Đang sản xuất" }
    );

    return savedProduction;
  } catch (error) {
    console.error("Lỗi khi tạo quy trình sản xuất:", error);
    throw new Error("Không thể tạo quy trình sản xuất");
  }
};

// get all single process
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
    const requests = await SingleProductionProcessing.find(query)
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

// get all consolidate process
const getAllConsolidateProcess = async () => {
  try {
    // Lấy danh sách theo điều kiện lọc
    const requests = await ConsolidateProductionProcessing.find()
      .populate("production_request_id user_id")
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Lấy danh sách quy trình sản xuất tổng hợp thành công!",
      data: requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get danh sách đang sảng xuất (type - single) của hệ thống
const getAllExecuteProcess = async () => {
  try {
    // Lấy danh sách theo điều kiện lọc
    const requests = await SingleProductionProcessing.find({
      status: "Đang sản xuất",
    })
      .populate("production_request_id user_id")
      .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo mới nhất

    return {
      success: true,
      message: "Get All Execute Process Success!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get danh sách đang sảng xuất (type - consolidate) của hệ thống
const getAllConsolidateExecuteProcess = async () => {
  try {
    // Lấy danh sách theo điều kiện lọc
    const requests = await ConsolidateProductionProcessing.find({
      status: "Đang sản xuất",
    })
      .populate("production_request_id user_id")
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Get All Execute Consolidate Process Success!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get All Histories Process
const getAllHistoriesProcess = async (type_process) => {
  try {
    const requests = await ProductionProcessHistory.find({
      process_model: type_process,
    }).populate("production_process");

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
    const updated = await SingleProductionProcessing.findByIdAndUpdate(
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
const completeProductionProcess = async (process_id, process_type) => {
  try {
    // Phân loại quy trình
    // 1 : update Production Process Status and final_time_finish
    if (process_type === "single_processes") {
      const productionProcessing = await SingleProductionProcessing.findById(
        process_id
      );
      console.log("Đơn => " , productionProcessing)

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
    } else {
      const productionProcessing = await ConsolidateProductionProcessing.findById(
        process_id
      );
      console.log("Tổng hợp => " , productionProcessing)
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
    }
    const objectProcessId = new mongoose.Types.ObjectId(process_id);

    // 2 : create record history for this production process
    const createdHistory = await ProductionProcessHistory.create({
      production_process: objectProcessId,
      process_model: process_type,
    });
    console.log("Lịch sử vừa tạo => " , createdHistory)
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
const finishStage = async (dataRequest) => {
  try {
    const { process_id, noStage, stage_id, process_type, dataUpdate } =
      dataRequest;

    const currentDate = new Date();

    // thông tin cập nhật mỗi giai đoạn
    const updateFields = {
      ...dataUpdate,
      status: "Hoàn thành",
      end_time: currentDate,
    };

    const stageUpdated = await ProcessStatus.findByIdAndUpdate(
      stage_id,
      updateFields,
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
      await createNextStage(process_id, parseInt(noStage), process_type);
    }

    if (parseInt(noStage) === 7) {
      console.log("Tạo lịch sử")
      const result = await completeProductionProcess(process_id, process_type);
      if (!result.success) return result;
    }
    return {
      success: true,
      message: "Cập nhật thành công!",
    };
  } catch (error) {
    console.log("Có lỗi : ", error);
    throw new Error(error.message);
  }
};

// Hàm tạo stage mới
const createNextStage = async (process_id, noStage, process_type) => {
  try {
    // Map tới Name của quy trình tiếp theo
    const nextStageName = stageMap[parseInt(noStage) + 1];
    // Map tới currentStage của quy trình tổng
    const process_stage_start = processStartCurrentMap[parseInt(noStage) + 1];
    // Map tới endCurrentStage của quy trình tổng
    const process_stage_end = processEndCurrentMap[parseInt(noStage)];

    if (!nextStageName || !process_stage_start || !process_stage_end) return;
    // Phân loại process theo process_type
    process_type === "single_processes"
      ? createNextStepForSingleProcess(
          noStage,
          nextStageName,
          process_stage_start,
          process_stage_end,
          process_id
        )
      : createNextStepForConsolidateProcess(
          noStage,
          nextStageName,
          process_stage_start,
          process_stage_end,
          process_id
        );
  } catch (error) {
    console.log("Có lỗi sảy ra trong quá trình cập nhật stage => ", error);
  }
};

// Create Process Following Process_type
const createNextStepForSingleProcess = async (
  noStage,
  nextStageName,
  process_stage_start,
  process_stage_end,
  process_id
) => {
  try {
    // get current time
    const currentDate = new Date();

    // tìm productionProcessing
    const processData = await SingleProductionProcessing.findById(
      process_id
    ).populate([
      {
        path: "production_request_id",
        populate: [
          {
            path: "material",
            populate: {
              path: "fuel_type_id storage_id", // Populate cả loại nhiên liệu và kho
            },
          },
          {
            path: "packaging.vacuumBagBoxId",
          },
          {
            path: "packaging.cartonBoxId",
          },
        ],
      },
      {
        path: "user_id",
      },
    ]);

    if (!processData) return;

    // kiểm tra xem = 6 thì tạo 1 lô sản phẩm
    if (parseInt(noStage) === 6) {
      const productionRequest = processData?.production_request_id;

      if (!productionRequest) {
        return {
          success: false,
          message: "Không tìm thấy thông tin yêu cầu sản xuất.",
        };
      }

      const type_material_id = new mongoose.Types.ObjectId(
        productionRequest.material
      );
      const origin_production_request_id = new mongoose.Types.ObjectId(
        productionRequest._id
      );
      const obectStoreId = new mongoose.Types.ObjectId(store_product_id);

      // Ngày tạo và hết hạn
      const created_date = new Date();
      const expiration_date = new Date(created_date);
      expiration_date.setMonth(expiration_date.getMonth() + 5);

      // ✅ Khởi tạo sản phẩm đầy đủ
      const productData = {
        masanpham: productionRequest.production_id,
        image: "../../assets/Feature_warehouse/prouct_carton_img.jpg",
        type_material_id,
        price: "",
        description: "",
        quantity: productionRequest.product_quantity,
        origin_production_request_id,
        created_date: convertDateStringV1(created_date),
        expiration_date: convertDateStringV1(expiration_date),
        certifications: "",
        is_storaged: false,
      };

      const created_product = await Product.create(productData);

      if (!created_product) {
        return {
          success: false,
          message:
            "Đã xảy ra lỗi trong quá trình tạo sản phẩm. Vui lòng thử lại sau",
        };
      }

      // Tạo đơn nhập kho
      const dataReceipt = {
        storage_id: obectStoreId,
        storage_date: created_date,
        production: created_product._id,
        quantity: created_product.quantity,
        receipt_type: "2", // type 2 = nhập kho thành phẩm
        status: "Chờ duyệt",
        is_deleted: false,
      };

      const receipt_store = await StoreReceipt.create(dataReceipt);

      if (!receipt_store) {
        return {
          success: false,
          message:
            "Đã xảy ra lỗi trong quá trình tạo yêu cầu nhập kho. Vui lòng thử lại sau",
        };
      }
      // ==> tạo đơn nhập kho -> push thông báo đến kho
      generatedNotifications({ receipt_store, created_product });
    }

    // Tăng stage hiện tại lên
    processData.current_stage += 1;
    // (processData.finalQuantityProduction = dataProduct?.quantity),
    processData[process_stage_start] = currentDate;
    processData[process_stage_end] = currentDate;

    await processData.save();

    const newStage = new ProcessStatus({
      process_id,
      process_type: processData.process_type,
      stage_name: nextStageName,
      start_time: new Date(),
    });

    await newStage.save();
  } catch (error) {
    console.log("Error => ", error);
    return {
      success: false,
      message: "Có lỗi trong quá trình cập nhật trạng thái quy trình",
    };
  }
};

// Luồng tạo stept kế tiếp cho quy trình tổng hợp
const createNextStepForConsolidateProcess = async (
  noStage,
  nextStageName,
  process_stage_start,
  process_stage_end,
  process_id
) => {
  try {
    // tìm productionProcessing
    const processData = await ConsolidateProductionProcessing.findById(
      process_id
    ).populate([
      {
        path: "production_request_id",
        populate: [
          {
            path: "material",
            populate: {
              path: "fuel_type_id storage_id", // Populate cả loại nhiên liệu và kho
            },
          },
          {
            path: "packaging.vacuumBagBoxId",
          },
          {
            path: "packaging.cartonBoxId",
          },
        ],
      },
      {
        path: "user_id",
      },
    ]);

    if (!processData) return;

    // kiểm tra xem = 6 thì tạo 1 lô sản phẩm
    if (parseInt(noStage) === 6) {
      const created_date = new Date();
      const expiration_date = new Date(created_date);
      expiration_date.setMonth(expiration_date.getMonth() + 5);

      const products = [];

      for (const req of processData?.production_request_id || []) {
        const type_material_id = new mongoose.Types.ObjectId(req.material);
        const origin_production_request_id = new mongoose.Types.ObjectId(
          req._id
        );
        const product_img_carton =
          "/assets/product-image/product_carton_img.jpg"; // sửa chính tả nếu cần

        const productData = {
          masanpham: req.production_id,
          image: product_img_carton,
          type_material_id,
          price: "",
          description: "",
          quantity: req.product_quantity,
          origin_production_request_id,
          created_date: convertDateStringV1(created_date),
          expiration_date: convertDateStringV1(expiration_date),
          certifications: "",
          is_storaged: false,
        };

        // Lưu sản phẩm vào DB trước để lấy _id sản phẩm
        const created_product = await Product.create(productData);
        const obectStoreId = new mongoose.Types.ObjectId(store_product_id);

        // Data receipt store
        const dataReceipt = {
          storage_id: obectStoreId,
          storage_date: created_date,
          production: created_product._id,
          quantity: created_product.quantity,
          receipt_type: "2",
          status: "Chờ duyệt",
          is_deleted: false,
        };

        const receipt_store = await StoreReceipt.create(dataReceipt);

        if (!receipt_store) {
          return {
            success: false,
            message:
              "Đã xảy ra lỗi trong quá trình tạo yêu cầu nhập kho. Vui lòng thử lại sau",
          };
        }

        products.push(created_product); // Push vào mảng sản phẩm sau khi tạo
        // ==> tạo đơn nhập kho -> push thông báo đến kho
        generatedNotifications({ receipt_store, created_product });
      }

      if (products.length === 0) {
        return {
          success: false,
          message:
            "Đã xảy ra lỗi trong quá trình tạo sản phẩm. Vui lòng thử lại sau",
        };
      }
    }

    // Tăng stage hiện tại lên
    processData.current_stage += 1;

    const currentDate = new Date();
    processData[process_stage_start] = currentDate;
    processData[process_stage_end] = currentDate;

    await processData.save();

    const newStage = new ProcessStatus({
      process_id,
      process_type: processData.process_type,
      stage_name: nextStageName,
      start_time: new Date(),
    });

    await newStage.save();
  } catch (error) {
    console.log("Error : ", error);
    throw new Error(error.message);
  }
};

const deleteById = async (id) => {
  try {
    // 1. Tìm đơn sản xuất theo id
    const deleted = await SingleProductionProcessing.findByIdAndDelete(id);
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
// Update single process status
const changeStatus = async (id) => {
  try {
    // 1. Tìm đơn sản xuất theo id
    const productionProcessing = await SingleProductionProcessing.findById(id);
    if (!productionProcessing) {
      return {
        success: false,
        message: "Không tìm thấy đơn sản xuất!",
      };
    }

    // 2. Đổi trạng thái SingleProductionProcessing thành "Đang sản xuất"
    productionProcessing.status = "Đang sản xuất";
    // Cập nhật current lên 1
    productionProcessing.current_stage = productionProcessing.current_stage + 1;
    productionProcessing.process_stage1_start = new Date();
    await productionProcessing.save();

    // 3. Tạo Process Stage 1
    const newProcessStatus = new ProcessStatus({
      process_id: productionProcessing._id,
      process_type: productionProcessing.process_type,
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

// Update status consolidate process
const approveConsolidateProcess = async (id) => {
  try {
    // 1. Tìm đơn sản xuất theo id
    const consolidateProcess = await ConsolidateProductionProcessing.findById(
      id
    );
    if (!consolidateProcess) {
      return {
        success: false,
        message: "Không tìm thấy đơn sản xuất!",
      };
    }

    // 2. Đổi trạng thái consolidateProcess thành "Đang sản xuất"
    consolidateProcess.status = "Đang sản xuất";
    // Cập nhật current lên 1
    consolidateProcess.current_stage = consolidateProcess.current_stage + 1;
    consolidateProcess.process_stage1_start = new Date();
    await consolidateProcess.save();

    // 3. Tạo Process Stage 1
    const newProcessStatus = new ProcessStatus({
      process_id: consolidateProcess._id,
      process_type: consolidateProcess.process_type,
      stage_name: "Phân loại nguyên liệu",
      start_time: new Date(),
    });

    await newProcessStatus.save();

    return {
      success: true,
      message: "Đã duyệt đơn thành công và tạo ProcessStatus!",
      data: {
        consolidateProcess,
        processStatus: newProcessStatus,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get Single Processing Details
const getProcessingDetails = async (id) => {
  try {
    // Lấy danh sách theo điều kiện lọc
    const requests = await SingleProductionProcessing.findById(id).populate([
      {
        path: "production_request_id",
        populate: [
          {
            path: "material",
            populate: {
              path: "fuel_type_id storage_id", // Populate cả loại nhiên liệu và kho
            },
          },
          {
            path: "packaging.vacuumBagBoxId",
          },
          {
            path: "packaging.cartonBoxId",
          },
        ],
      },
      {
        path: "user_id",
      },
    ]);

    return {
      success: true,
      message: "Get SingleProductionProcessing details successfully!",
      data: requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get Single Processing Details
const getConsolidateProcessingDetails = async (id) => {
  try {
    // Lấy danh sách theo điều kiện lọc
    const requests = await ConsolidateProductionProcessing.findById(
      id
    ).populate([
      {
        path: "production_request_id",
        populate: [
          {
            path: "material",
            populate: {
              path: "fuel_type_id storage_id", // Populate cả loại nhiên liệu và kho
            },
          },
          {
            path: "packaging.vacuumBagBoxId",
          },
          {
            path: "packaging.cartonBoxId",
          },
        ],
      },
      {
        path: "user_id",
      },
    ]);

    return {
      success: true,
      message: "Get SingleProductionProcessing details successfully!",
      data: requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// get Single Processing Details
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

// get Consolidate Processing Details
const getConsolidateProcessStage = async (id) => {
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
    // 1. Đếm số lượng kế hoạch sản xuất theo trạng thái "Chờ duyệt"
    const waitingPlanCount = await ProductionRequest.countDocuments({
      status: "Chờ duyệt",
    });

    // 2. Đếm số lượng quy trình đơn theo trạng thái
    const processingCount = await SingleProductionProcessing.countDocuments({
      status: "Đang sản xuất",
    });
    const doneCount = await SingleProductionProcessing.countDocuments({
      status: "Hoàn thành",
    });

    // 3. Đếm số lượng quy trình đang thực hiện
    const executingSingle = processingCount;
    const executingConsolidate =
      await ConsolidateProductionProcessing.countDocuments({
        status: "Đang sản xuất",
      });

    // 4. Tổng số quy trình đã tạo
    const totalSingleProcess =
      await SingleProductionProcessing.countDocuments();
    const totalConsolidateProcess =
      await ConsolidateProductionProcessing.countDocuments();

    // 5. Tổng số kế hoạch sản xuất
    const totalProductionPlans = await ProductionRequest.countDocuments();

    // 6. Danh sách kế hoạch mới nhất
    const latestProductionPlans = await ProductionRequest.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Danh sách kế hoạch đã duyệt nhưng chưa có quy trình
    const usedInSingle = await SingleProductionProcessing.find().distinct(
      "production_request_id"
    );
    const consolidateList = await ConsolidateProductionProcessing.find().select(
      "production_request_id"
    );
    const usedInConsolidate = consolidateList.flatMap(
      (doc) => doc.production_request_id || []
    );
    const usedIds = [
      ...new Set([
        ...usedInSingle,
        ...usedInConsolidate.map((id) => id.toString()),
      ]),
    ];

    const waitingToBeCreatedPlans = await ProductionRequest.find({
      status: "Đã duyệt",
      _id: { $nin: usedIds },
    });

    // 8. Trả kết quả về client
    return {
      // 📌 Các số liệu chính
      waiting: waitingPlanCount, // ✅ lấy từ bảng ProductionRequest
      processing: processingCount,
      done: doneCount,

      executingSingle,
      executingConsolidate,

      totalSingleProcess,
      totalConsolidateProcess,
      totalProductionPlans,

      // 📌 Dữ liệu hiển thị thêm
      latestPlans: latestProductionPlans,
      plansWaitingProcessCreate: waitingToBeCreatedPlans,
    };
  } catch (error) {
    throw new Error("Lỗi khi thống kê dashboard: " + error.message);
  }
};

// Generated Notificatiosn
const generatedNotifications = async (data) => {
  try {
    const { receipt_store, created_product } = data;

    const io = socket.getIO();

    const newNoti = {
      user_id: null,
      role_id: [warehouse_mng_role_id], // send to
      title: `Y/c nhập kho lạnh - Mã nhập kho : ${receipt_store?._id}`,
      text_message: `Lô thành phẩm mới ${created_product?.masanpham} đã được tạo và cần được nhập kho lạnh.`,
      type: ["warehouse"],
      is_read: false,
      description: "Lô thành phẩm mới vừa được tạo - cần nhập kho thành phẩm",
    };

    const newNotification = await Notifications.create(newNoti);
    console.log("newNoti => ", newNotification);
    if (!newNotification) {
      return {
        status: 400,
        success: false,
        message: "Tạo thông báo thất bại",
      };
    }
    io.emit("pushNotification", {
      ...newNotification.toObject(),
      timestamp: newNotification.createdAt,
    });
  } catch (error) {
    console.log("Đã có lỗi tại quá trình tạo thông báo");
    throw new Error(error.message);
  }
};

// Thống kê quy trình theo ngày và trạng thái
const getProductionProcessChartData = async () => {
  try {
    const aggregateResult = await SingleProductionProcessing.aggregate([
      {
        $project: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$start_time" },
          },
          status: 1,
        },
      },
      {
        $group: {
          _id: { date: "$date", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to chart format
    const chartMap = {};

    aggregateResult.forEach((item) => {
      const date = item._id.date;
      const status = item._id.status;

      if (!chartMap[date]) {
        chartMap[date] = { date, ĐangSảnXuất: 0, HoànThành: 0 };
      }

      if (status === "Đang sản xuất") {
        chartMap[date].ĐangSảnXuất = item.count;
      } else if (status === "Hoàn thành") {
        chartMap[date].HoànThành = item.count;
      }
    });

    const chartData = Object.values(chartMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return chartData;
  } catch (error) {
    throw new Error(
      "Lỗi khi lấy dữ liệu biểu đồ quy trình sản xuất: " + error.message
    );
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
  createConsolidateProcess,
  getAllConsolidateProcess,
  approveConsolidateProcess,
  getAllConsolidateExecuteProcess,
  getConsolidateProcessingDetails,
  getConsolidateProcessStage,
  getProductionProcessChartData,
};
