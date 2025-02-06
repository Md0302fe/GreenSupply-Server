const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    masanpham: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: 0,
    },
    origin: {
      type: String,
      required: true,
    },
    certifications: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, 
  }
);

const ProductModel = mongoose.model("Products", ProductSchema);

module.exports = ProductModel;
