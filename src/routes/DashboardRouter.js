const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/DashboardController");

router.get("/overview", DashboardController.getDashboardOverview);

module.exports = router;
