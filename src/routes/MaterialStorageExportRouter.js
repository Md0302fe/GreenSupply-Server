// import express
const express = require("express");
// import express router
const router = express.Router();

const MaterialStorageExportController = require("../controllers/MaterialStorageExportController");

const {
    authMidleware,
    authUserMidleware,
  } = require("../middleware/AuthMidleware");

  router.post("/createRawMaterialBatch", MaterialStorageExportController.create);

  router.get("/getAllRawMaterialBatch", MaterialStorageExportController.getAll);
  
  router.get("/getRawMaterialBatchById/:id", MaterialStorageExportController.getDetails);

  router.post("/accept_storage_export", MaterialStorageExportController.AcceptStorageExport);

  router.post("/reject_storage_export", MaterialStorageExportController.RejectStorageExport);
  
  router.get("/getTotalMaterialStorageExports", MaterialStorageExportController.getTotalMaterialStorageExports);

  router.get("/getStockExportByDate", MaterialStorageExportController.getStockExportByDate);

  router.get("/getStockExportCompletedByDate", MaterialStorageExportController.getStockExportCompletedByDate);
  
  module.exports = router;