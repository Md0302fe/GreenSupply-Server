// import express
const express = require("express");
// import express router
const router = express.Router();

const PurchaseOrderController = require("../controllers/PurchaseOrderController");

const {
  authMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

// Routes cho Address
router.post(
  "/createPurchaseOrder",
  authMidleware,
  PurchaseOrderController.createPurchaseOrder
);
router.put(
  "/updatePurchaseOrder/:id", authMidleware,
  PurchaseOrderController.updatePurchaseOrder
);

router.put(
  "/acceptPurchaseOrder/:id", authMidleware,
  PurchaseOrderController.acceptPurchaseOrder
);
router.put(
  "/softDelete/:id",
  authMidleware,
  PurchaseOrderController.deletePurchaseOrder
);
router.delete(
  "/deleteAllPurchaseOrders",
  authMidleware,
  PurchaseOrderController.deleteAllPurchaseOrders
);
router.get("/getAllPurchaseOrder", PurchaseOrderController.getAllPurchaseOrder);
router.get("/searchPurchaseOrder", PurchaseOrderController.searchPurchaseOrder);
router.get(
  "/getPurchaseOrderDetail/:id",
  PurchaseOrderController.getPurchaseOrderDetail
);

router.get(
  "/dashboard-supplyrequest",
  PurchaseOrderController.getDashboardSupplyrequest
);

module.exports = router;
