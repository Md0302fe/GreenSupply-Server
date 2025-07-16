// import express
const express = require("express");
// import express router
const router = express.Router();

const BatchHistoryController = require("../controllers/BatchHistoryController");

const {
    authAdminMidleware,
    authUserMidleware,
  } = require("../middleware/AuthMidleware");

  // Routes cho Address

  router.get("/getAllBatchStorageExportHistory", BatchHistoryController.getAllHistory);
  router.post("/getBatchStorageExportDetails", BatchHistoryController.getById);


  module.exports = router;