const ProductionRequest = require("../models/Production_Request");
const MaterialManagement = require("../models/Material_Management");
const RawMaterialBatch = require("../models/Raw_Material_Batch");
const PackageMaterial = require("../models/Package_Material");
const PackageMaterialCategory = require("../models/Package_Material_Categorie");

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

// generated batch id
const generateBatchId = (prefix = "XMTH") => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Định dạng 2 số
  const day = String(today.getDate()).padStart(2, "0"); // Định dạng 2 số

  const batchNumber = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${prefix}${day}${month}${year}-${batchNumber}`;
};

// generated production batch id
const generateProductionId = (prefix = "PMG") => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Định dạng 2 số
  const day = String(today.getDate()).padStart(2, "0"); // Định dạng 2 số

  const batchNumber = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${prefix}${day}${month}${year}-${batchNumber}`;
};

const createProductRequest = async (productData) => {
  try {
    // 1. Tạo một ProductionRequest mới
    productData.status = "Chờ duyệt";
    // khởi tạo 1 id đọc nhất --> dùng để truy xuất sản phẩm với quy trình sau này
    productData.production_id = generateProductionId();
    const newProduct = new ProductionRequest(productData);

    // 2. Tìm MaterialManagement và trừ số lượng
    const fuelDoc = await MaterialManagement.findById(productData.material);
    if (!fuelDoc) {
      throw new Error("Không tìm thấy nhiên liệu!");
    }

    // 3. Trừ số lượng nhiên liệu trong kho
    if (fuelDoc.quantity >= productData.material_quantity) {
      fuelDoc.quantity -= productData.material_quantity;
      await fuelDoc.save();
    } else {
      throw new Error("Số lượng nhiên liệu không đủ trong kho!");
    }

    // 4. Lưu đơn sản xuất
    await newProduct.save();

    return {
      status: "Create New Product Is Successfully!",
      product: newProduct,
      statusCode: 200,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAll = async (filters) => {
  try {
    // Kết quả
    const requests = await ProductionRequest
    .find()
    .populate({
      path: 'material',
      populate : {path : 'fuel_type_id'}
    })
    .sort({ createdAt: -1 })
    

    return {
      success: true,
      status: "Lấy danh sách loại nhiên liệu thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// get all pending for create product
const getProductionRequests = async (filters) => {
  try {
    // Kết quả
    const requests = await ProductionRequest.find({ status: "Đã duyệt" })
      .populate({
        path: "material", // populate cho trường material trong ProductionRequest
        populate: {
          path: "fuel_type_id", // populate thêm fuel_type_id trong FuelManagement
          model: "materials", // Đảm bảo bạn đang populate từ mô hình materials
        },
      })
      .sort({
        createdAt: -1,
      });

    return {
      success: true,
      status: "Lấy danh sách loại nhiên liệu thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllProcessing = async (filters) => {
  try {
    const requests = await ProductionRequest.find({ status: "Đã duyệt" })
      .populate({
        path: "material",
        populate: [
          {
            path: "fuel_type_id",
            select: "type_name description image",
          },
        ],
      })
      .sort({ createdAt: -1 });

    return {
      success: true,
      status: "Lấy danh sách loại nhiên liệu thành công!",
      requests,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const update = async (id, data) => {
  try {
    const updated = await ProductionRequest.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      throw new Error("Không tìm thấy nhiên liệu!");
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
    const deleted = await ProductionRequest.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Không tìm thấy đơn sản xuất!");
    }

    // 2. Tìm MaterialManagement liên quan đến sản phẩm đã xóa
    const fuelDoc = await MaterialManagement.findById(deleted.material);
    if (!fuelDoc) {
      throw new Error("Không tìm thấy nhiên liệu tương ứng trong kho!");
    }

    // 3. Cộng lại số lượng nhiên liệu vào kho
    fuelDoc.quantity += deleted.material_quantity;
    await fuelDoc.save();

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
    const productionRequest = await ProductionRequest.findById(id);
    if (!productionRequest) {
      return {
        success: false,
        message: "Không tìm thấy đơn sản xuất!",
      };
    }

    // 2. Tạo 1 RawMaterialBatch mới, batch_id lấy từ ProductionRequest
    const newBatch = await RawMaterialBatch.create({
      batch_id: generateBatchId(),
      batch_name: productionRequest.request_name,
      status: "Đang chuẩn bị",
      fuel_type_id: productionRequest.material,
      quantity: productionRequest.material_quantity, // hoặc material_quantity
      storage_id: productionRequest.material.storage_id, // Truyền storage_id từ fuelDoc
      production_request_id: productionRequest._id,
      is_automatic: false,
    });

    // 3. Trừ bao bì
    const packaging = productionRequest.packaging || {};
    const { vacuumBag, carton, vacuumBagBoxId, cartonBoxId } =
      productionRequest.packaging || {};

    // Trừ túi chân không
    if (vacuumBag > 0 && vacuumBagBoxId) {
      const vacuumBagBox = await PackageMaterial.findById(vacuumBagBoxId);
      if (vacuumBagBox) {
        vacuumBagBox.quantity -= vacuumBag;
        await vacuumBagBox.save();

        await PackageMaterialCategory.findByIdAndUpdate(
          vacuumBagBox.package_material_categories,
          { $inc: { quantity: -vacuumBag } }
        );
      }
    }

    // Trừ thùng carton
    if (carton > 0 && cartonBoxId) {
      const cartonBox = await PackageMaterial.findById(cartonBoxId);
      if (cartonBox) {
        cartonBox.quantity -= carton;
        await cartonBox.save();

        await PackageMaterialCategory.findByIdAndUpdate(
          cartonBox.package_material_categories,
          { $inc: { quantity: -carton } }
        );
      }
    }

    // 4. Đổi trạng thái ProductionRequest thành "Đã duyệt"
    productionRequest.status = "Đã duyệt";
    await productionRequest.save();

    // 5. Sau khi xong tất cả tiến hành tạo thông báo
    if (productionRequest) {
      const dataToPushNotif = { newBatch }; // thông tin lô nguyên liệu cần chuẩn bị
      generatedNotifications(dataToPushNotif);
    }

    return {
      success: true,
      message: "Đã duyệt đơn sản xuất thành công!",
      data: productionRequest,
    };
  } catch (error) {
    console.log("Đã có lỗi: ", error);
    throw new Error(error.message);
  }
};

const getProductionChartData = async () => {
  try {
    const result = await ProductionRequest.aggregate([
      {
        $match: {
          status: { $in: ["Chờ duyệt", "Đã duyệt"] },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%m-%d-%Y", date: "$createdAt" },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          counts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          "Chờ duyệt": {
            $let: {
              vars: {
                filtered: {
                  $filter: {
                    input: "$counts",
                    as: "item",
                    cond: { $eq: ["$$item.status", "Chờ duyệt"] },
                  },
                },
              },
              in: { $ifNull: [{ $arrayElemAt: ["$$filtered.count", 0] }, 0] },
            },
          },
          "Đã duyệt": {
            $let: {
              vars: {
                filtered: {
                  $filter: {
                    input: "$counts",
                    as: "item",
                    cond: { $eq: ["$$item.status", "Đã duyệt"] },
                  },
                },
              },
              in: { $ifNull: [{ $arrayElemAt: ["$$filtered.count", 0] }, 0] },
            },
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    throw new Error("Lỗi khi thống kê yêu cầu sản xuất: " + error.message);
  }
};

const generatedNotifications = async (data) => {
  try {
    const { newBatch } = data;

    const io = socket.getIO();

    const newNoti = {
      user_id: null,
      role_id: [warehouse_mng_role_id], // send to
      title: `Yêu cầu chuẩn bị lô: ${newBatch?.batch_id}`,
      text_message: `Lô nguyên liệu ${newBatch?.batch_id} (${newBatch?.batch_name}) đã được tạo và cần được chuẩn bị.`,
      type: ["warehouse"],
      is_read: false,
      description: "Yêu cầu chuẩn bị lô nguyên liệu",
    };

    const newNotification = await Notifications.create(newNoti);

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

module.exports = {
  createProductRequest,
  getAll,
  getAllProcessing,
  update,
  deleteById,
  changeStatus,
  getProductionChartData,
  getProductionRequests,
};
