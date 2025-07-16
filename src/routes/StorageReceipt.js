const express = require("express");
const router = express.Router();

const FuelStorageReceiptController = require("../controllers/StorageReceiptController");

const {
  // authAdminMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

router.post(
  "/create",
  authUserMidleware,
  FuelStorageReceiptController.createFuelStorageReceipt
);
router.get(
  "/getAll",
  authUserMidleware,
  FuelStorageReceiptController.getAllFuelStorageReceipts
);
router.put(
  "/update/:id",
  authUserMidleware,
  FuelStorageReceiptController.updateFuelStorageReceiptStatus
);
router.get(
  "/storage/:id",
  authUserMidleware,
  FuelStorageReceiptController.getFuelStorageById
);
//Dashboard
router.get(
  "/getTotalFuelStorageReceipts",
  FuelStorageReceiptController.getTotalFuelStorageReceipts
);

router.get(
  "/getStockImportByDate",
  FuelStorageReceiptController.getStockImportByDate
);

router.get(
  "/getStockImportCompletedByDate",
  FuelStorageReceiptController.getStockImportCompletedByDate
);

module.exports = router;
