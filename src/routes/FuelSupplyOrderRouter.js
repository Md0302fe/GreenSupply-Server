const express = require("express");
const router = express.Router();

const FuelSupplyOrderController = require('../controllers/FuelSupplyOrderController');

const {
  // authMidleware,
  // authUserMidleware,
} = require("../middleware/AuthMidleware");

router.post('/createFuelSupplyRequest', FuelSupplyOrderController.createFuelSupplyRequest);

module.exports = router; 