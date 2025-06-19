const mongoose = require("mongoose");

const ProcessStatusSchema = new mongoose.Schema(
  {
    process_id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "process_type"},
    process_type: { type: String, required: true, enum: ["single_processes", "consolidated_processes"]},
    stage_no: { type: String, default: "1"},
    stage_name: { type: String,
      enum: [
        "Phân loại nguyên liệu",
        "Rửa – gọt vỏ - tách hạt – cắt lát",
        "Chần để ức chế enzyme",
        "Điều vị (ngâm đường/muối)",
        "Sấy (máy sấy lạnh hoặc đối lưu)",
        "Làm nguội – đóng gói – dán nhãn",
        "Bảo quản lạnh",
      ],
      default: "Phân loại nguyên liệu",
    },
    note: { type: String, default: null},
    status: { type: String, enum: ["Đang thực thi", "Hoàn thành", "Đã hủy"], default: "Đang thực thi"},
    start_time: { type: Date, },
    end_time: { type: Date, },
    // infomation for each stage
    // stage 1
    lastQuantityStage1: { type: String, default: "0"}, // khối lượng cuối gđ 1
    lossPercentStage1: { type: String, default: "0"}, // tỷ hệ lao hụt so với tổng nguyên liệu thô
    // stage 2
    lastQuantityStage2 : { type: String, default: "0"}, // khối lượng cuối gđ 2
    lossPercentStage2: { type: String, default: "0"}, // tỷ hệ lao hụt so với tổng khối lượng của gđ 1
    // stage 4
    lastQuantityStage4: { type: String, default: "0"}, // khối lượng cuối gđ 4
    lossPercentStage4: { type: String, default: "0"}, // tỷ hệ lao hụt so với tổng khối lượng của gđ 2
    solutionConcentration: { type: String, default: "0"},
    soakingTime: { type: String, default: "0"},
    moistureBeforeDrying: { type: String, default: "0"},
    // stage 5
    lastQuantityStage5: { type: String, default: "0"}, // khối lượng cuối gđ 5
    lossQuantityByDrying: { type: String, default: "0"}, // tỷ hệ lao hụt so với tổng khối lượng của gđ 4
    dryingTime: { type: String, default: "0"},
    // stage 6
    finalQuantityProduction: { type: String, default: "0"}, // khối lượng thành phẩm
    finalLossPercent: { type: String, default: "0"}, // tỷ lệ hao hụt cả quá trình = (kl ban đầu - kl thành phẩm) / kl thành phẩm * 100
    totalVacum: { type: String, default: "0"}, // tổng số lượng túi chân không cần dùng
    totalBag: { type: String, default: "0"}, // tổng số lượng túi carton cần dùng
    // stage7
    warehouseReceipt : { type: String, default: "Đang xử lý"}, // tình trạng nhập kho thành phẩm
  },
  { timestamps: true } // Tự động tạo `createdAt` & `updatedAt`
);

// Tạo model từ schema
const ProcessStatus = mongoose.model("process_status", ProcessStatusSchema);
module.exports = ProcessStatus;
