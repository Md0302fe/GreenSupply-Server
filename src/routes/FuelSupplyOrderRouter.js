const express = require("express");
const router = express.Router();

const FuelSupplyOrderController = require('../controllers/FuelSupplyOrderController');

const {
  authMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

router.post('/createFuelSupplyRequest', FuelSupplyOrderController.createFuelSupplyRequest);
router.get('/getAllFuelSupplyRequest', authUserMidleware, FuelSupplyOrderController.getAllFuelSupplyRequest);
router.put('/deleteFuelSupplyRequest/:id', FuelSupplyOrderController.deleteFuelSupplyRequest);
router.put('/updateFuelSupplyRequest/:id', FuelSupplyOrderController.updateFuelSupplyRequest);
router.get('/getFuelSupplyRequestById/:id', FuelSupplyOrderController.getById);

module.exports = router; 