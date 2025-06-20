const mongoose = require("mongoose");

const ProductionProcessSchema = new mongoose.Schema(
  {
    production_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "production_requests",
      required: true,
    }, // Yc sản xuất
    production_name: { type: String, required: true }, // Tên quy trình sản xuất
    start_time: { type: Date }, // Thời gian bắt đầu
    end_time: { type: Date }, // Thời gian kết thúc
    current_stage: { type: Number, default: 0 },
    processed_quantity: { type: Number, default: 0 },
    waste_quantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Chờ duyệt", "Đang sản xuất", "Hoàn thành", "Tạm hoãng", "Đã hủy"],
      default: "Chờ duyệt",
    },
    process_type: {
      type: String,
      default: "single_processes",
    },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    note: { type: String, default: null },
    process_stage1_start: { type: Date, default: null },
    process_stage1_end: { type: Date, default: null },
    process_stage2_start: { type: Date, default: null },
    process_stage2_end: { type: Date, default: null },
    process_stage3_start: { type: Date, default: null },
    process_stage3_end: { type: Date, default: null },
    process_stage4_start: { type: Date, default: null },
    process_stage4_end: { type: Date, default: null },
    process_stage5_start: { type: Date, default: null },
    process_stage5_end: { type: Date, default: null },
    process_stage6_start: { type: Date, default: null },
    process_stage6_end: { type: Date, default: null },
    process_stage7_start: { type: Date, default: null },
    process_stage7_end: { type: Date, default: null },
    final_time_finish: { type: Date, default: null },
    // infomation compare with plan
    lastQuantityStage1: { type: Number, default: 0 },
    lastQuantityStage2: { type: Number, default: 0 },
    lastQuantityStage3: { type: Number, default: 0 },
    lastQuantityStage4: { type: Number, default: 0 },
    lastQuantityStage5: { type: Number, default: 0 },
    finalQuantityProduction: { type: Number, default: 0 },
    finalLossQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Tạo model từ schema
const Production = mongoose.model("single_processes", ProductionProcessSchema);

module.exports = Production;
