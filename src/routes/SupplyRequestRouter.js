const express = require("express");
const router = express.Router();

const SupplyOrderController = require('../controllers/SupplyOrderController');

const {
  // authMidleware,
  // authUserMidleware,
} = require("../middleware/AuthMidleware");

router.post('/createSupplyRequest', SupplyOrderController.createSupplyRequest);

module.exports = router; 