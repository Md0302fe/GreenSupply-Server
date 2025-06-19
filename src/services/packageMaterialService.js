const Box = require("../models/Package_Material");
const BoxCategory = require("../models/Package_Material_Categorie");
const storage_id = "665480f9bde459d62ca7d001";
// Box Category Services
const createBoxCategory = async (data) => {
  const newCategory = new BoxCategory({ ...data, quantity: 0 });
  return await newCategory.save();
};

const updateBoxCategory = async (id, data) => {
  return await BoxCategory.findByIdAndUpdate(id, data, { new: true });
};

const deleteBoxCategory = async (id) => {
  return await BoxCategory.findByIdAndUpdate(id, { is_delete: true });
};

const getBoxCategories = async (includeInactive = false) => {
  const filter = {};
  if (!includeInactive) {
    filter.is_delete = false;  // Chỉ lấy những cái chưa xoá
  }
  return await BoxCategory.find(filter);
};



// Box Services
const createBox = async (data) => {
  const {
    package_material_name,
    package_material_categories,
    quantity,
    package_img,
    type,
    capacity, // Đây là giá trị người dùng nhập
  } = data;

  // 👉 Chuyển capacity sang gam nếu là túi chân không
  const adjustedCapacity = type === "túi chân không" ? capacity * 1000 : capacity;

  const newBox = new Box({
    package_material_name,
    package_material_categories,
    quantity,
    package_img,
    type,
    capacity: adjustedCapacity, // dùng capacity đã chuyển đổi
    storage_id,
  });

  const savedBox = await newBox.save();

  // Cập nhật tổng quantity cho category
  await BoxCategory.findByIdAndUpdate(package_material_categories, {
    $inc: { quantity },
  });

  return savedBox;
};



const updateBox = async (id, data) => {
  const existingBox = await Box.findById(id);
  if (!existingBox) {
    throw new Error("Không tìm thấy thùng để cập nhật");
  }

  // Lấy số lượng cũ và mới
  const oldQuantity = existingBox.quantity;
  const newQuantity = typeof data.quantity === "number" ? data.quantity : oldQuantity;
  const quantityDiff = newQuantity - oldQuantity;

  // Cập nhật thông tin box (kể cả tên, ảnh, mô tả...)
  const updatedBox = await Box.findByIdAndUpdate(
    id,
    {
      ...data,
      quantity: newQuantity,
    },
    { new: true }
  );
  const categoryId =
    updatedBox.package_material_categories?._id || updatedBox.package_material_categories;

  // Nếu có thay đổi về số lượng, cập nhật tổng số lượng trong category
  if (quantityDiff !== 0) {
    await BoxCategory.findByIdAndUpdate(categoryId, {
      $inc: { quantity: quantityDiff },
    });
  }

  return updatedBox;
};


const deleteBox = async (id) => {
  const box = await Box.findById(id);
  if (!box || box.is_delete) {
    throw new Error("Không tìm thấy box hoặc box đã bị xóa");
  }
  // Đánh dấu xóa
  await Box.findByIdAndUpdate(id, { is_delete: true });

  // Trừ số lượng của box khỏi tổng quantity category
  await BoxCategory.findByIdAndUpdate(box.package_material_categories, {
    $inc: { quantity: -box.quantity },
  });
};


const getBoxes = async (categoryId) => {
  const filter = { is_delete: false };
  if (categoryId) {
    filter.package_material_categories = categoryId;
  }

  return await Box.find(filter).populate("package_material_categories");
};


// Inventory operations
const importBox = async (id, quantity) => {
  const box = await Box.findByIdAndUpdate(id, { $inc: { quantity } }, { new: true });
  await BoxCategory.findByIdAndUpdate(box.package_material_categories, {
    $inc: { quantity },
  });
  return box;
};

const exportBox = async (id, quantity) => {
  const box = await Box.findById(id);
  if (!box || box.quantity < quantity) {
    throw new Error("Không đủ số lượng để xuất kho");
  }
  box.quantity -= quantity;
  await box.save();
  await BoxCategory.findByIdAndUpdate(box.package_material_categories, {
    $inc: { quantity: -quantity },
  });
  return box;
};

module.exports = {
  createBoxCategory,
  updateBoxCategory,
  deleteBoxCategory,
  getBoxCategories,
  createBox,
  updateBox,
  deleteBox,
  getBoxes,
  importBox,
  exportBox,
};
