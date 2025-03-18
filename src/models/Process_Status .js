const mongoose = require("mongoose");

const ProcessStatusSchema = new mongoose.Schema(
    {
        process_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "production_processing", // Tham chiếu đến quy trình sản xuất
            required: true,
        },
        stage_name: {
            type: String,
            default: "Phân loại nguyên liệu xoài",
        },
        note: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["Đang thực thi", "Hoàn thành"],
            default: "Đang thực thi",
        },
    },
    { timestamps: true } // Tự động tạo `createdAt` & `updatedAt`
);

// Tạo model từ schema
const ProcessStatus = mongoose.model("process_status", ProcessStatusSchema);

module.exports = ProcessStatus;
