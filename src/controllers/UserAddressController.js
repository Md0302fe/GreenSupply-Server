const UserAddress = require("../models/UserAdress");

exports.getAddressesByUserId = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "Thiếu user_id" });
    }

    const addresses = await UserAddress.find({ user_id, is_deleted: false });

    if (!addresses.length) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ nào!" });
    }

    res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Lỗi lấy danh sách địa chỉ:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
