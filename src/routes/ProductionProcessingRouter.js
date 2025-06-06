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
  // Get All Execute Single Process
  router.get("/getAllExecuteProcess", ProductionProcessingController.getAllExecuteProcess);

  // Get All Execute Consolidate Process
  router.get("/getAll-Execute-ConsolidateProcess", ProductionProcessingController.getAllConsolidateExecuteProcess);

  router.get("/getAllProcessing", ProductionProcessingController.getAllProcessing);
  router.put("/:id", ProductionProcessingController.update);
  router.delete("/:id", ProductionProcessingController.deleteById);

  // update status single production process
  router.put("/change-status/:id", ProductionProcessingController.changeStatus);
  // update status consolidate production process
  router.put("/approve-consolidate-status/:id", ProductionProcessingController.approveConsolidateProcess);

  // Single Process Details & Details Stage by Id
  router.get("/details/:id",ProductionProcessingController.getDetailsProcess);
  router.get("/detailsStage/:id",ProductionProcessingController.getProcessStage);

  // Consolidate Process Details & Details Stage by Id
  router.get("/consolidate-details/:id",ProductionProcessingController.getDetailsConsolidateProcess);
  router.get("/consolidate-detailsStage/:id",ProductionProcessingController.getConsolidateProcessStage);

  router.post("/finishStage", ProductionProcessingController.finishStage);

  // Router create consolidate process
  router.post("/consolidated-create", authMidleware , ProductionProcessingController.createConsolidateProcess);

  // Get All Consolidate Process
  router.get("/get-consolidate-process", ProductionProcessingController.getAllConsolidateProcess);

  // Get All Production Process History
  router.get("/history_process/", ProductionProcessingController.getAllHistoriesProcess);

  // Router cho dashboard
  router.get("/dashboard", ProductionProcessingController.getDashboardprocess);

  module.exports = router;