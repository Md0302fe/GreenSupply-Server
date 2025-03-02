const RawMaterialBatch = require("../models/Raw_Material_Batch");

const create = async (productData) => {
  try {
    productData.batch_id = generateBatchId();
    productData.status = "Chờ duyệt";
    const newProduct = new RawMaterialBatch(productData);
    await newProduct.save();
    return { status: "Create New Product Is Successfully!", product: newProduct, statusCode: 200 };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAll = async (filters) => {
  try {
    // Kết quả
    const requests = await RawMaterialBatch.find().sort({ createdAt: -1 });

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
    const updated = await RawMaterialBatch.findByIdAndUpdate(
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

const cancel = async (id) => {
  try {
    const canceled = await RawMaterialBatch.findByIdAndUpdate(
      id,
      { is_deleted: true, updatedAt: new Date() },
      { new: true }
    );

    if (!canceled) {
      throw new Error("Không tìm thấy nhiên liệu!");
    }

    return {
      success: true,
      message: "Đã đánh dấu nhiên liệu là 'Đã xóa'!",
      data: canceled,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  create,
  getAll,
  update,
  cancel,
};
