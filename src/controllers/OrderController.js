const FuelRequest = require("../models/Material_Collection_Request");
const FuelSupplyOrder = require("../models/Material_Provide_Request");
const AdminFuelEntry = require("../models/Purchase_Material_Plan");

const mongoose = require("mongoose");
const socket = require("../socket.js");
const UserModel = require("../models/UserModel.js");
const Notifications = require("../models/Notifications.js");


const OrderServices = require("../services/OrderService");

// GetAll order by status đã duyệt
const getAllApprovedRequests = async (req, res) => {
  try {
    const response = await OrderServices.getAllApprovedRequests();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      eMsg: error.message || "Lỗi không lấy được danh sách yêu cầu đã duyệt",
    });
  }
};

/// API lấy danh sách đã duyệt từ bảng FuelRequest
const getAllApprovedFuelRequests = async (req, res) => {
  try {
    const response = await OrderServices.getAllApprovedFuelRequests();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      eMsg: error.message || "Lỗi không lấy được danh sách yêu cầu thu hàng đã duyệt",
    });
  }
};

/// API lấy danh sách đã duyệt từ bảng FuelSupplyOrder
const getAllApprovedFuelSupplyOrders = async (req, res) => {
  try {
    const response = await OrderServices.getAllApprovedFuelSupplyOrders();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      eMsg: error.message || "Lỗi không lấy được danh sách đơn cung cấp nhiên liệu đã duyệt",
    });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
      const { id } = req.params; // Lấy ID đơn hàng từ URL
      const { status } = req.body; // Lấy trạng thái mới từ request body

      const response = await OrderServices.updateOrderStatus(id, status);

      return res.status(200).json(response);
  } catch (error) {
      return res.status(500).json({ success: false, message: "Lỗi khi cập nhật trạng thái!", error: error.message });
  }
};


const SupplierOrderDashboard = async (req, res) => {
  try {
    const data = await OrderServices.SupplierOrderDashboard();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin Dashboard",
      error: error.message
    });
  }
};


















/////////////////////////////////////////////////////////////////////////////////////////////////////


// Lấy tất cả yêu cầu nhiên liệu với các bộ lọc
const getFuelRequests = async (req, res) => {
  try {

    const requests = await FuelRequest.find().populate('supplier_id').sort({ createdAt: -1 }); // Populate để lấy thông tin nhà cung cấp
    if (!requests) {
      res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
    }
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
  }
};

// Lấy tất cả đơn cung cấp nhiên liệu với các bộ lọc
const getFuelSupplyOrders = async (req, res) => {
  try {
    const orders = await FuelSupplyOrder.find().populate('supplier_id').populate('address'); // Populate để lấy thông tin nhà cung cấp
    if (!orders) {
      res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Requests" });
    }
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy dữ liệu Fuel Supply Orders" });
  }
};

const getAllProvideOrders = async (req, res) => {
  try {
    const filters = req.query;
    const response = await OrderServices.getAllProvideOrders(filters);
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

// Lấy yêu cầu nhiên liệu theo ID
const getFuelRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FuelRequest.findById(id).populate("supplier_id");
    if (!request) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy yêu cầu nhiên liệu" });
  }
};

// Chấp nhận yêu cầu nhiên liệu
const acceptFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await FuelRequest.findByIdAndUpdate(id, { status: "Đã duyệt" }, { new: true });
    // sau khi xác nhận -> send notifications to supplier người tạo ra cái đơn này
    // 1. get thông tin người tạo đơn
    if (!response) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    
    if (response) {
        const supplier_id = response?.supplier_id; // id người dùng
        const io = socket.getIO();
    
          const newNoti = {
            user_id: new mongoose.Types.ObjectId(supplier_id), // Người tạo đơn
            role_id: null, // không gữi đến admin trong case này
            title: "Yêu cầu đã được duyệt",
            text_message: `${response?.fuel_name} đã được xác nhận`, // tên yêu cầu + thông báo xác nhận
            type: ["request_supplier"], //
            is_sended: true, // được gữi đến -> 
            is_read: false, // chưa đọc
            description: "Xác nhận yêu cầu thu nguyên liệu thành công",
          };
    
          const newNotification = await Notifications.create(newNoti);
          console.log(newNotification);
    
          if (!newNotification) {
            return {
              status: 400,
              success: false,
              message: "Tạo thông báo thất bại",
            };
          }
          io.emit("pushNotification_Send_To_Supplier", {
            ...newNotification.toObject(),
            timestamp: newNotification.createdAt,
          });
        }

    return res.json({ success: true, data: response });
  } catch (error) {
    console.log("error => ", error)
    res.status(500).json({ success: false, error: "Lỗi khi chấp nhận yêu cầu nhiên liệu" });
  }
};

// Từ chối yêu cầu nhiên liệu
const rejectFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await FuelRequest.findByIdAndUpdate(id, { status: "Đã hủy" }, { new: true });
    if (!response) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });

    if (response) {
        const supplier_id = response?.supplier_id; // id người dùng
        const io = socket.getIO();
    
          const newNoti = {
            user_id: new mongoose.Types.ObjectId(supplier_id), // Người tạo đơn
            role_id: null, // không gữi đến admin trong case này
            title: "Yêu cầu đã bị từ chuối",
            text_message: `${response?.fuel_name} đã bị từ chối`, // tên yêu cầu + thông báo xác nhận
            type: ["request_supplier"], //
            is_sended: true, // được gữi đến -> 
            is_read: false, // chưa đọc
            description: "Từ chối yêu cầu thu nguyên liệu thành công",
          };
    
          const newNotification = await Notifications.create(newNoti);
          console.log(newNotification);
    
          if (!newNotification) {
            return {
              status: 400,
              success: false,
              message: "Tạo thông báo thất bại",
            };
          }
          io.emit("pushNotification_Send_To_Supplier", {
            ...newNotification.toObject(),
            timestamp: newNotification.createdAt,
          });
        }

    return res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi từ chối yêu cầu nhiên liệu" });
  }
};

// Hoàn thành yêu cầu nhiên liệu
const completeFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FuelRequest.findByIdAndUpdate(id, { status: "Hoàn thành" }, { new: true });
    if (!request) return res.status(404).json({ success: false, error: "Yêu cầu không tồn tại" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi hoàn thành yêu cầu nhiên liệu" });
  }
};


// Lấy đơn cung cấp nhiên liệu theo ID
const getFuelSupplyOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findById(id).populate("supplier_id").populate('address');
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi lấy đơn cung cấp nhiên liệu" });
  }
};

// Chấp nhận đơn cung cấp nhiên liệu
// const acceptFuelSupplyOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await FuelSupplyOrder.findByIdAndUpdate(id, { status: "Đã duyệt" }, { new: true });
//     if (!response) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    
//     if (response) {
//         const supplier_id = response?.supplier_id; // id người dùng
//         const io = socket.getIO();
    
//           const newNoti = {
//             user_id: new mongoose.Types.ObjectId(supplier_id), // Người tạo đơn
//             role_id: null, // không gữi đến admin trong case này
//             title: "Đơn cung cấp đã được duyệt",
//             text_message: `${response?.fuel_name} đã được xác nhận`, // tên yêu cầu + thông báo xác nhận
//             type: ["request_supplier"], //
//             is_sended: true, // được gữi đến -> 
//             is_read: false, // chưa đọc
//             description: "Xác nhận yêu cầu thu nguyên liệu thành công",
//           };
    
//           const newNotification = await Notifications.create(newNoti);
//           console.log(newNotification);
    
//           if (!newNotification) {
//             return {
//               status: 400,
//               success: false,
//               message: "Tạo thông báo thất bại",
//             };
//           }
//           io.emit("pushNotification_Send_To_Supplier", {
//             ...newNotification.toObject(),
//             timestamp: newNotification.createdAt,
//           });
//         }
    

//     const order = await FuelSupplyOrder.findByIdAndUpdate(
//       id,
//       { status: "Đã duyệt" },
//       { new: true }
//     );
//     if (!order) {
//       return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
//     }

//     const updateRemainQuantity = await AdminFuelEntry.findById(order.request_id);
//     if (!updateRemainQuantity) {
//       return res.status(404).json({ success: false, error: "Không tìm thấy AdminFuelEntry" });
//     }

//     const currentQuantityRemain = Number(updateRemainQuantity.quantity_remain) || 0;
//     const newQuantityRemain = currentQuantityRemain - Number(order.quantity);

//     const updatedEntry = await AdminFuelEntry.findByIdAndUpdate(
//       order.request_id,
//       { quantity_remain: newQuantityRemain }, // Thay vì dùng `$inc`, cập nhật giá trị mới
//       { new: true }
//     );
//     if (updatedEntry.quantity_remain <= 0) {
//       await AdminFuelEntry.findByIdAndUpdate(
//         order.request_id,
//         { $set: { status: "Đã Hoàn Thành" } },
//         { new: true }
//       );

//       await FuelSupplyOrder.updateMany(
//         { request_id: order.request_id, status: "Chờ duyệt" },
//         { $set: { status: "Vô hiệu hóa", note: "Đơn hàng bị vô hiệu hóa do đã đủ chỉ tiêu" } }
//       );
//     }

//     res.json({ success: true, data: order });
//   } catch (error) {
//     console.error("Lỗi khi chấp nhận đơn cung cấp nhiên liệu:", error);
//     res.status(500).json({ success: false, error: "Lỗi khi chấp nhận đơn cung cấp nhiên liệu" });
//   }
// };

const acceptFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Tìm đơn trước, chưa đổi trạng thái
    const order = await FuelSupplyOrder.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    }

    // Idempotent: nếu đã duyệt rồi thì trả về luôn
    if (order.status === "Đã duyệt") {
      return res.json({ success: true, data: order, message: "Đơn đã ở trạng thái Đã duyệt" });
    }
    if (!order.request_id) {
      return res.status(400).json({ success: false, error: "Thiếu request_id liên kết" });
    }

    // 2) Lấy kế hoạch nhập (AdminFuelEntry)
    const entry = await AdminFuelEntry.findById(order.request_id);
    if (!entry) {
      return res.status(404).json({ success: false, error: "Không tìm thấy AdminFuelEntry" });
    }

    const qty = Number(order.quantity) || 0;
    const remain = Number(entry.quantity_remain) || 0;
    const newRemain = remain - qty;

    if (qty <= 0) {
      return res.status(400).json({ success: false, error: "Số lượng đơn không hợp lệ" });
    }
    if (newRemain < 0) {
      return res.status(400).json({
        success: false,
        error: "Số lượng còn lại không đủ để duyệt đơn này",
      });
    }

    // 3) Cập nhật số lượng còn lại trước (để nếu fail thì chưa đổi status)
    const updatedEntry = await AdminFuelEntry.findByIdAndUpdate(
      order.request_id,
      { $set: { quantity_remain: newRemain } },
      { new: true }
    );

    // 4) Nếu đã đủ/âm về 0 thì cập nhật trạng thái kế hoạch + vô hiệu hóa đơn pending khác
    if ((updatedEntry.quantity_remain || 0) <= 0) {
      await AdminFuelEntry.findByIdAndUpdate(
        order.request_id,
        { $set: { status: "Đã Hoàn Thành" } },
        { new: true }
      );

      await FuelSupplyOrder.updateMany(
        { request_id: order.request_id, status: "Chờ duyệt" },
        { $set: { status: "Vô hiệu hóa", note: "Đơn hàng bị vô hiệu hóa do đã đủ chỉ tiêu" } }
      );
    }

    // 5) Mọi thứ OK → đổi trạng thái đơn sang Đã duyệt
    order.status = "Đã duyệt";
    await order.save();

    // 6) Gửi notification SAU khi mọi cập nhật thành công
    try {
      const supplier_id = order?.supplier_id;
      const io = socket.getIO();
      const newNoti = await Notifications.create({
        user_id: new mongoose.Types.ObjectId(supplier_id),
        role_id: null,
        title: "Đơn cung cấp đã được duyệt",
        text_message: `${order?.fuel_name} đã được xác nhận`,
        type: ["request_supplier"],
        is_sended: true,
        is_read: false,
        description: "Xác nhận yêu cầu thu nguyên liệu thành công",
      });
      if (newNoti) {
        io.emit("pushNotification_Send_To_Supplier", {
          ...newNoti.toObject(),
          timestamp: newNoti.createdAt,
        });
      }
    } catch (e) {
      // Không fail cả request chỉ vì gửi noti lỗi
      console.warn("Gửi notification lỗi:", e?.message);
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error("Lỗi khi chấp nhận đơn cung cấp nhiên liệu:", error);
    return res.status(500).json({ success: false, error: "Lỗi khi chấp nhận đơn cung cấp nhiên liệu" });
  }
};



// Từ chối đơn cung cấp nhiên liệu
const rejectFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await FuelSupplyOrder.findByIdAndUpdate(id, { status: "Đã hủy" }, { new: true });
    if (!response) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });

    if (response) {
        const supplier_id = response?.supplier_id; // id người dùng
        const io = socket.getIO();
    
          const newNoti = {
            user_id: new mongoose.Types.ObjectId(supplier_id), // Người tạo đơn
            role_id: null, // không gữi đến admin trong case này
            title: "Đơn cung cấp đã bị từ chuối",
            text_message: `${response?.fuel_name} đã bị từ chối`, // tên yêu cầu + thông báo xác nhận
            type: ["request_supplier"], //
            is_sended: true, // được gữi đến -> 
            is_read: false, // chưa đọc
            description: "Từ chối yêu cầu thu nguyên liệu thành công",
          };
    
          const newNotification = await Notifications.create(newNoti);
          console.log(newNotification);
    
          if (!newNotification) {
            return {
              status: 400,
              success: false,
              message: "Tạo thông báo thất bại",
            };
          }
          io.emit("pushNotification_Send_To_Supplier", {
            ...newNotification.toObject(),
            timestamp: newNotification.createdAt,
          });
        }

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi từ chối đơn cung cấp nhiên liệu" });
  }
};

// Hoàn thành đơn cung cấp nhiên liệu
const completeFuelSupplyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FuelSupplyOrder.findByIdAndUpdate(id, { status: "Hoàn thành" }, { new: true });
    if (!order) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi khi hoàn thành đơn cung cấp nhiên liệu" });
  }
};

module.exports = {
  getAllApprovedRequests,
  getFuelRequests,
  getAllProvideOrders,
  getFuelSupplyOrders,
  getFuelRequestById,
  acceptFuelRequest,
  rejectFuelRequest,
  completeFuelRequest,
  getFuelSupplyOrderById,
  acceptFuelSupplyOrder,
  rejectFuelSupplyOrder,
  completeFuelSupplyOrder,
  getAllApprovedFuelSupplyOrders,
  getAllApprovedFuelRequests,
  updateOrderStatus,
  SupplierOrderDashboard,
};
  