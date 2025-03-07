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

  module.exports = router;