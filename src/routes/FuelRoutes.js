const express = require("express");
const router = express.Router();
const FuelController = require("../controllers/FuelController");

const { authUserMidleware } = require("../middleware/AuthMidleware");

router.get("/getAll", FuelController.getAll);
router.put("/update/:id", authUserMidleware, FuelController.updateFuel);
router.put("/cancel/:id", FuelController.cancelFuel); 

module.exports = router;
