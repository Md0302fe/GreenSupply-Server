const express = require("express");
const router = express.Router();
const FuelController = require("../controllers/MaterialManagementController");

const { authUserMidleware } = require("../middleware/AuthMidleware");

router.get("/getAll", FuelController.getAll);
router.put("/update/:id", authUserMidleware, FuelController.updateFuel);
router.put("/cancel/:id", FuelController.cancelFuel); 
router.post("/create", FuelController.createFuel);



//router dashboard
router.get("/dashboard/summary", FuelController.getDashboardSummary);
router.get("/dashboard/fuel-types", FuelController.getFuelTypesOverview);
router.get("/dashboard/history", FuelController.getFuelHistory);
router.get("/dashboard/alerts", FuelController.getLowStockAlerts);


module.exports = router;
