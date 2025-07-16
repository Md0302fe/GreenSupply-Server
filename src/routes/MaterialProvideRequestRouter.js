const express = require("express");
const router = express.Router();

const MaterialProvideRequest = require('../controllers/MaterialProvideRequestController');

const {
  authAdminMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

router.post('/createFuelSupplyRequest', MaterialProvideRequest.createFuelSupplyRequest);
router.get('/getAllFuelSupplyRequest', authUserMidleware, MaterialProvideRequest.getAllFuelSupplyRequest);
router.put('/deleteFuelSupplyRequest/:id', MaterialProvideRequest.deleteFuelSupplyRequest);
router.put('/updateFuelSupplyRequest/:id', MaterialProvideRequest.updateFuelSupplyRequest);
router.get('/getFuelSupplyRequestById/:id', MaterialProvideRequest.getById);

module.exports = router; 