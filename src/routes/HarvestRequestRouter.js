// import express
const express = require("express");
// import express router
const router = express.Router();

const HarvestrequestController = require('../controllers/HarvestRequestController');

const {
  authAdminMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

router.post('/createHarvestRequest', HarvestrequestController.createHarvestRequest);
router.put('/updateHarvestRequest/:id', HarvestrequestController.updateHarvestRequest);
router.put('/cancelHarvestRequest/:id', HarvestrequestController.cancelHarvestRequest);
router.get('/getHarvestRequestById/:id', HarvestrequestController.getHarvestRequestById);
router.get('/getAllHarvestRequests', authUserMidleware, HarvestrequestController.getAllHarvestRequests);

// Get Harvest Request Histories
router.get('/getHarvestRequestHistories', authUserMidleware, HarvestrequestController.getHarvestRequestHistories);

module.exports = router;

