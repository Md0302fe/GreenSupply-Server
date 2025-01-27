// import express
const express = require("express");
// import express router
const router = express.Router();

const ProductController = require("../controllers/ProductController");

const {
    authMidleware,
    authUserMidleware,
  } = require("../middleware/AuthMidleware");


  // Routes cho Address
  router.post("/create", ProductController.createProduct);
  router.put("/update/:id", ProductController.updateProduct);
  router.delete("/delete/:id", ProductController.deleteProduct);
  router.get("/getAll", ProductController.getAllProduct);
  router.get("/search", ProductController.searchProduct);    

  module.exports = router;