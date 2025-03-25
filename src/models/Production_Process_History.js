const mongoose = require("mongoose");

const ProductionProcessHistorySchema = new mongoose.Schema(
  {
    production_process: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "production_processing",
      required: true,
    }, // ref to production_processing model
  },
  { timestamps: true }
);

// Tạo model từ schema
const ProductionProcessHistory = mongoose.model(
  "production_process_histories",
  ProductionProcessHistorySchema
);

module.exports = ProductionProcessHistory;
