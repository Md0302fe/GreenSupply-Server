// import express
const express = require("express");
// import express router
const router = express.Router();

const RawMaterialBatchController = require("../controllers/RawMaterialBatchController");

const {
    authMidleware,
    authUserMidleware,
  } = require("../middleware/AuthMidleware");

  // Routes cho Address
  router.get("/storages", RawMaterialBatchController.getAllStorages);
  router.post("/createRawMaterialBatch", RawMaterialBatchController.create);
  router.get("/getAllRawMaterialBatch", RawMaterialBatchController.getAll);
  router.get("/getRawMaterialBatchById/:id", RawMaterialBatchController.getById);
  router.put("/updateRawMaterialBatch/:id", RawMaterialBatchController.update);
  router.get("/getBatchByRequestId/:id", RawMaterialBatchController.getBatchByRequestId);
  router.put("/updateRawMaterialBatchStatus/:id", RawMaterialBatchController.updateStatus);
  router.get("/getTotalRawMaterialBatches", RawMaterialBatchController.getTotalRawMaterialBatches);

  module.exports = router;