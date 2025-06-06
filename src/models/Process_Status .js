const mongoose = require("mongoose");

const ProcessStatusSchema = new mongoose.Schema(
  {
    process_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "process_type",
    },
    process_type: {
      type: String,
      required: true,
      enum: ["single_processes", "consolidated_processes"],
    },
    stage_no: {
      type: String,
      default: "1",
    },
    stage_name: {
      type: String,
      enum: [
        "Phân loại nguyên liệu",
        "Rửa và làm sạch",
        "Khử trùng/diệt khuẩn bề mặt",
        "Phủ màng sinh học & làm khô",
        "Ủ chín (kiểm soát nhiệt độ/độ ẩm)",
        "Đóng gói thành phẩm",
        "Ghi nhãn & truy xuất nguồn gốc",
        "Bảo quản lạnh",
      ],
      default: "Phân loại nguyên liệu",
    },

    note: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["Đang thực thi", "Hoàn thành", "Đã hủy"],
      default: "Đang thực thi",
    },

    start_time: {
      type: Date,
    },

    end_time: {
      type: Date,
    },
  },
  { timestamps: true } // Tự động tạo `createdAt` & `updatedAt`
);

// Tạo model từ schema
const ProcessStatus = mongoose.model("process_status", ProcessStatusSchema);

module.exports = ProcessStatus;
