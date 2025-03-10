// import express
const express = require("express");
// import express router
const router = express.Router();

const BatchHistoryController = require("../controllers/BatchHistoryController");

const {
    authMidleware,
    authUserMidleware,
  } = require("../middleware/AuthMidleware");

  // Routes cho Address

  router.get("/getAllRawMaterialBatch", BatchHistoryController.getAllHistory);
  router.get("/getRawMaterialBatchById/:id", BatchHistoryController.getById);


  module.exports = router;