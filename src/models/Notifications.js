const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationsSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: "",
    },
    role_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roles",
        default: "",
      },
    ],
    title: {
      type: String,
      required: true,
      trim: true,
    },
    text_message: {
      type: String,
      trim: true,
    },
    type: [
      {
        type: String,
        enum: [
          "warehouse",
          "process",
          "material",
          "product",
          "request_supplier",
        ],
      },
    ],
    is_read: {
      type: Boolean,
      default: false,
    },
    is_delete: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Notifications = mongoose.model("notifications", notificationsSchema);
module.exports = Notifications;
