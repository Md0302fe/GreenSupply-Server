const express = require("express");
const router = express.Router();
const UserAddressController = require("../controllers/UserAddressController");

router.get("/user-addresses", UserAddressController.getAddressesByUserId);

module.exports = router;
