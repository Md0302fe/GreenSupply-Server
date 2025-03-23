// import express
const express = require("express");
// import express router
const router = express.Router();

const ProductRequestController = require("../controllers/ProductRequestController");

const {
    authMidleware,
    authUserMidleware,
  } = require("../middleware/AuthMidleware");

  // Routes cho Address
  router.post("/createProductionRequest", ProductRequestController.createProductRequest);
  router.get("/getAll", ProductRequestController.getAll);
  router.get("/getAllProcessing", ProductRequestController.getAllProcessing);
  router.put("/:id", ProductRequestController.update);
  router.delete("/:id", ProductRequestController.deleteById);
  router.put("/change-status/:id", ProductRequestController.changeStatus);
  router.get("/getProductionChartData", ProductRequestController.getProductionChartData)

  module.exports = router;