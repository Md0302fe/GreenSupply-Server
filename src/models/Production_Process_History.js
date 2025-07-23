const mongoose = require("mongoose");

const ProductionProcessHistorySchema = new mongoose.Schema(
  {
    production_process: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "process_model", 
      required: true,
    }, 
    process_model: {
      type: String,
      required: true,
      enum: ["single_processes", "consolidated_processes"], 
    }
  },
  { timestamps: true }
);

// Tạo model từ schema
const ProductionProcessHistory = mongoose.model(
  "production_process_histories",
  ProductionProcessHistorySchema
);

module.exports = ProductionProcessHistory;
