const express = require("express");
const router = express.Router();

const FuelSupplyOrderController = require('../controllers/FuelSupplyOrderController');

const {
  // authMidleware,
  // authUserMidleware,
} = require("../middleware/AuthMidleware");

router.post('/createFuelSupplyRequest', FuelSupplyOrderController.createFuelSupplyRequest);
router.get('/getAllFuelSupplyRequest', FuelSupplyOrderController.getAllFuelSupplyRequest);
router.put('/deleteFuelSupplyRequest/:id', FuelSupplyOrderController.deleteFuelSupplyRequest);
router.put('/updateFuelSupplyRequest/:id', FuelSupplyOrderController.updateFuelSupplyRequest);

module.exports = router; 