const service = require("../services/packageMaterialService");

// Box Category Controllers
const createBoxCategory = async (req, res) => {
  try {
    const data = await service.createBoxCategory(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.code || "UNKNOWN_ERROR",
      error: err.message,
    });
  }
};


const updateBoxCategory = async (req, res) => {
  try {
    const data = await service.updateBoxCategory(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBoxCategory = async (req, res) => {
  try {
    await service.deleteBoxCategory(req.params.id);
    res.json({ success: true, message: "Đã xoá loại thùng" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBoxCategories = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';  // Lấy từ query param
    const data = await service.getBoxCategories(includeInactive);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Box Controllers
const createBox = async (req, res) => {
  try {
    const data = await service.createBox(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBox = async (req, res) => {
  try {
    const data = await service.updateBox(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBox = async (req, res) => {
  try {
    await service.deleteBox(req.params.id);
    res.json({ success: true, message: "Đã xoá thùng" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBoxes = async (req, res) => {
  try {
    const categoryId = req.query.category_id; // Lấy category_id từ query param


    const data = await service.getBoxes(categoryId);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Nhập xuất kho
const importBox = async (req, res) => {
  try {
    const data = await service.importBox(req.params.id, req.body.quantity);
    res.json({ success: true, message: "Nhập kho thành công", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const exportBox = async (req, res) => {
  try {
    const data = await service.exportBox(req.params.id, req.body.quantity);
    res.json({ success: true, message: "Xuất kho thành công", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
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
