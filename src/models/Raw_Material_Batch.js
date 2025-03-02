const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const RawMaterialBatchSchema = new Schema(
    {
        batch_id: { type: String, required: true },
        name: { type: String, required: true },
        fuel_type_id: { type: Types.ObjectId, ref: "fuel_types", required: false },
        status: { type: String, required: false },
        quantity: { type: Number, required: true, default: 0 },
        storage_id: { type: Types.ObjectId, ref: "fuel_storages", required: false },
        production_request_id: { type: Types.ObjectId, ref: "production_requests", required: false },
        is_automatic: { type: Boolean, default: false },
    },
    {
        timestamps: true
    }
);
RawMaterialBatchSchema.index({ batch_id: 1 }, { unique: true });
const RawMaterialBatch = mongoose.model("raw_material_batchs", RawMaterialBatchSchema);

module.exports = RawMaterialBatch;
