// import express
const express = require("express");
// import express router
const router = express.Router();

const PurchaseOrderController = require("../controllers/PurchaseOrderController");

const {
  authAdminMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

// Routes cho Address
router.post(
  "/createPurchaseOrder",
  authAdminMidleware,
  PurchaseOrderController.createPurchaseOrder
);
router.put(
  "/updatePurchaseOrder/:id", authAdminMidleware,
  PurchaseOrderController.updatePurchaseOrder
);

router.put(
  "/acceptPurchaseOrder/:id", authAdminMidleware,
  PurchaseOrderController.acceptPurchaseOrder
);
router.put(
  "/softDelete/:id",
  authAdminMidleware,
  PurchaseOrderController.deletePurchaseOrder
);
router.delete(
  "/deleteAllPurchaseOrders",
  authAdminMidleware,
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
