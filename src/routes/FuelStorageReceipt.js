const express = require("express");
const router = express.Router();

const FuelStorageReceiptController = require('../controllers/FuelStorageReceiptController');

const {
  // authMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

router.post('/create', authUserMidleware, FuelStorageReceiptController.createFuelStorageReceipt);
router.get('/getAll', authUserMidleware, FuelStorageReceiptController.getAllFuelStorageReceipts);
router.put('/update/:id', authUserMidleware, FuelStorageReceiptController.updateFuelStorageReceiptStatus);

module.exports = router; 