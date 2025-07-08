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
  router.post("/createProduct", ProductController.createProduct);
  router.put("/updateProduct/:id", ProductController.updateProduct);
  router.delete("/deleteProduct/:id", ProductController.deleteProduct);
  router.delete('/deleteAllProducts', ProductController.deleteAllProducts);
  router.get("/getAllProduct", ProductController.getAllProduct);
  router.get("/searchProduct", ProductController.searchProduct);    
  router.get("/getProductDetail/:id", ProductController.getProductDetail);
  
  // get product by product code
  router.get("/getProductDetailV2/:productCode", ProductController.getProductDetailByCode);


  // get product dashboard
  router.get("/getProductDashboard", ProductController.getProductDashboard);

  module.exports = router;