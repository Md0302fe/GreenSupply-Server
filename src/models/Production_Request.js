    const mongoose = require('mongoose');
    const {  Types } = mongoose;

    const ProductionRequestSchema = new mongoose.Schema({
        production_id: { type: String, required: true, unique: true },
        request_name: { type: String, required: true },
        status: { type: String, required: true },
        material: {type: Types.ObjectId, ref: "material_managements", required: true },
        material_quantity: { type: Number, required: true }, // số lượng Nl cần cho việc sx
        product_quantity: { type: Number, required: true }, // kl nhiên liệu đầu ra
        production_date: { type: Date, required: true }, // ngày bắt đầu sản xuất
        end_date: { type: Date }, // ngày kết thúc sản xuất
        request_type: { type: String, required: true },
        loss_percentage: { type: Number, min: 0, max: 100 },
        priority: { type: Number, required: true, min: 1, max: 3 }, // Mức độ ưu tiên (có thể sử dụng giá trị từ 1 đến 3)
        note: { type: String },
        packaging: {
            vacuumBag: { type: Number, default: 0 },
            carton: { type: Number, default: 0 },
            vacuumBagBoxId: { type: mongoose.Schema.Types.ObjectId, ref: "package_materials" },
            cartonBoxId: { type: mongoose.Schema.Types.ObjectId, ref: "package_materials" },
    }
    },
    { timestamps: true }
    );

    const ProductionRequest = mongoose.model('production_requests', ProductionRequestSchema);

    module.exports = ProductionRequest;
