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
    filter.is_delete = false; // Chỉ lấy những cái chưa xoá
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
    capacity,
    dimensions, // { length, width, height }
  } = data;

  const { length, width, height = 1 } = dimensions;

  // ✅ 1. Phân loại size theo kích thước
  let size_category = "chưa xác định";

  if (type === "túi chân không") {
    const area = length * width;
    if (area <= 250) size_category = "nhỏ";
    else if (area <= 400) size_category = "trung bình";
    else size_category = "lớn";
  } else if (type === "thùng carton") {
    const volume = length * width * height;
    if (volume <= 9000) size_category = "nhỏ";
    else if (volume <= 17000) size_category = "trung bình";
    else size_category = "lớn";
  }

  // ✅ 2. Kiểm tra capacity hợp lý với size
  const limits = {
    "túi chân không": {
      nhỏ: 200,         // g
      "trung bình": 500,
      lớn: 1000,
    },
    "thùng carton": {
      nhỏ: 3.5,         // kg
      "trung bình": 7,
      lớn: 10,
    },
  };

  const limit = limits[type]?.[size_category];
  if (limit && capacity > limit) {
    throw new Error(
      `Dung tích ${capacity}${type === "túi chân không" ? "g" : "kg"} vượt quá mức cho phép với size ${size_category.toUpperCase()} (${limit}${type === "túi chân không" ? "g" : "kg"}).`
    );
  }

  // ✅ 3. Tạo box mới
  const newBox = new Box({
    package_material_name,
    package_material_categories,
    quantity,
    package_img,
    type,
    capacity,
    storage_id,
    dimensions: { length, width, height },
    size_category,
  });

  const savedBox = await newBox.save();

  // ✅ 4. Cập nhật tổng quantity của loại
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
  const newQuantity =
    typeof data.quantity === "number" ? data.quantity : oldQuantity;
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
    updatedBox.package_material_categories?._id ||
    updatedBox.package_material_categories;

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

  const boxes = await Box.find(filter).populate("package_material_categories");

  // 🪄 Gắn thêm size_label theo size_category
  const mappedBoxes = boxes.map((box) => {
    let sizeLabel = "Không rõ";
    switch (box.size_category) {
      case "nhỏ":
        sizeLabel = "Size S";
        break;
      case "trung bình":
        sizeLabel = "Size M";
        break;
      case "lớn":
        sizeLabel = "Size L";
        break;
    }
    return {
      ...box.toObject(), // trả về object thường để dễ append field mới
      size_label: sizeLabel,
    };
  });

  return mappedBoxes;
};

// Inventory operations
const importBox = async (id, quantity) => {
  const box = await Box.findByIdAndUpdate(
    id,
    { $inc: { quantity } },
    { new: true }
  );
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
