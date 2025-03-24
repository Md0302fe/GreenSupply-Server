// import express
const express = require("express");
// import express router
const router = express.Router();

const ProductionProcessingController = require("../controllers/ProductionProcessingController");

const {
    authMidleware,
    authUserMidleware,
  } = require("../middleware/AuthMidleware");

  // Routes cho Address
  router.post("/create", ProductionProcessingController.create);
  router.get("/getAll", ProductionProcessingController.getAll);
  router.get("/getAllExecuteProcess", ProductionProcessingController.getAllExecuteProcess);
  router.get("/getAllProcessing", ProductionProcessingController.getAllProcessing);
  router.put("/:id", ProductionProcessingController.update);
  router.delete("/:id", ProductionProcessingController.deleteById);
  router.put("/change-status/:id", ProductionProcessingController.changeStatus);
  router.get("/details/:id",ProductionProcessingController.getDetailsProcess);
  router.get("/detailsStage/:id",ProductionProcessingController.getProcessStage);
  router.post("/finishStage/", ProductionProcessingController.finishStage);


  // Router cho dashboard
  router.get("/dashboard", ProductionProcessingController.getDashboardprocess);

  module.exports = router;