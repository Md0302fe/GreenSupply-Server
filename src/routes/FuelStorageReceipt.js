const express = require("express");
const router = express.Router();

const FuelStorageReceiptController = require('../controllers/FuelStorageReceiptController');

const {
  // authMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

router.post('/create', authUserMidleware, FuelStorageReceiptController.createFuelStorageReceipt);



module.exports = router; 