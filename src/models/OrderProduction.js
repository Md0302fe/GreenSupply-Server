const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true }, // Mã đơn hàng (ví dụ: ORD123456)
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }, // ID khách hàng
    items: [OrderItemSchema], // Danh sách sản phẩm trong đơn hàng

    totalAmount: { type: Number, required: true }, // Tổng tiền hàng
    discount: { type: Number, default: 0 }, // Giảm giá (nếu có)
    shippingFee: { type: Number, default: 0 }, // Phí vận chuyển (Hiện để = 0 (free))
    taxAmount: { type: Number, default: 0 }, // Thuế VAT (Hiện để = 0 (k có phí VAT))
    grandTotal: { type: Number, required: true }, // Tổng tiền cuối cùng (sau thuế, giảm giá, phí ship , (save trường này = công thức rõ ràng nhé))

    status: {
      type: String,
      enum: ["Chờ xác nhận", "Đang xử lý", "Đang vận chuyển", "Đã giao", "Đã hủy", "Trả hàng"],
      default: "Chờ xác nhận"
    }, // Trạng thái đơn hàng

    paymentMethod: {
      type: String,
      enum: ["COD", "Credit Card", "PayPal", "Bank Transfer"],
      required: true
    }, // Phương thức thanh toán

    paymentStatus: {
      type: String,
      enum: ["Chờ giao dịch", "Đã thanh toán", "Thất bại", "Hoàng tiền"],
      default: "Chờ giao dịch"
    }, // Trạng thái thanh toán

    shippingAddressId: { type: mongoose.Schema.Types.ObjectId, ref: "user_address", required: true }, // Tham chiếu đến bảng user_address

    trackingNumber: { type: String, default: "" }, // Mã vận đơn
    expectedDeliveryDate: { type: Date }, // Ngày dự kiến giao hàng
    deliveryDate: { type: Date }, // Ngày giao hàng thực tế
    note: { type: String, default: "" }, // Ghi chú của khách hàng

    createdAt: { type: Date, default: Date.now }, // Ngày tạo đơn hàng
    updatedAt: { type: Date, default: Date.now }  // Ngày cập nhật đơn hàng gần nhất
  },
  { timestamps: true }
);

// Tạo model Order từ schema
const Order = mongoose.model("orders", OrderSchema);

module.exports = Order;
