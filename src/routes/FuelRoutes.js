const express = require("express");
const router = express.Router();

const FuelController = require('../controllers/FuelController');

const {
  // authMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

router.get('/getAll', authUserMidleware, FuelController.getAll);

module.exports = router; 