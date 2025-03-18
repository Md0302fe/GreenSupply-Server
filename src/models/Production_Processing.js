const mongoose = require("mongoose");

const ProductionProcessSchema = new mongoose.Schema({
    production_request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'production_requests', required: true }, // Yc sản xuất
    production_name: { type: String, required: true }, // Tên quy trình sản xuất
    start_time: { type: Date }, // Thời gian bắt đầu
    end_time: { type: Date }, // Thời gian kết thúc
    current_stage: { type: Number, default: 0 },
    processed_quantity: { type: Number, default: 0 },
    waste_quantity: { type: Number, default: 0 },
    status: { type: String, default: "Chờ duyệt" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
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
}, { timestamps: true });

// Tạo model từ schema
const Production = mongoose.model("production_processing", ProductionProcessSchema);

module.exports = Production;
