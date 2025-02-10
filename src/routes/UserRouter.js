// import express
const express = require("express");
// import express router
const router = express.Router();

const UserController = require("../controllers/UserController");

const {
  authMidleware,
  authUserMidleware,
} = require("../middleware/AuthMidleware");

// # CREATE - USER / POST
router.post("/sign-up", UserController.createUser);
// # COMPLETE PROFILE - USER / POST
router.post("/complete-profile", UserController.completeProfile);
// # CREATE - OTP / POST
router.post("/create-otp", UserController.createOtp);
// # LOGIN - USER / POST
router.post("/sign-in", UserController.userLogin);
// # LOGOUT - USER / POST
router.post("/log-out", UserController.userLogout);
// # UPDATE - USER / PUT
router.put("/update-user/:id", authUserMidleware, UserController.updateUser);
// # PUT - USER / PUT
router.put("/block-user/:id", authMidleware, UserController.blockUser);
// # PUT - USER / PUT
router.put("/unblock-user/:id", authMidleware, UserController.unBlockUser);
// # GET ALL USER - USER / GET
router.get("/getAll", authMidleware, UserController.getAllUser);
// # GET DETAIL USER - USER / GET
router.get("/detail-user/:id", authUserMidleware, UserController.getDetailUser);
// # POST REFRESH--TOKEN - POST
router.post("/refresh-token", UserController.refreshToken);
// # DELETE DELETE--MANY-TOKEN - DELETE
router.delete("/delete-many", authMidleware, UserController.deleteManyUser);

// 
router.post("/check-email", UserController.checkEmail);
router.post("/check-password", UserController.checkPassword);
router.post("/check-otp", UserController.checkOTP);
router.post("/check-otp-change-password", UserController.checkOtpChangePassword);
router.post("/update-password", UserController.updatePassword);

// Routes cho Address
router.post("/address/create", authUserMidleware, UserController.createAddress);
router.put("/address/update/:id", authUserMidleware, UserController.updateAddress);
router.delete("/address/delete/:id", authUserMidleware, UserController.deleteAddress);
router.get("/address/getAll", authUserMidleware, UserController.getAllAddresses);
router.get("/address/detail/:id", authUserMidleware, UserController.getDetailAddress);



module.exports = router;
// File này là UserRouter / Router dành riêng cho User

/*-------------------------------------------------------*/
// router ==> controller ==> services
// sau đó services gữi 1 json(object) ==> controller ==> return res.status(200).json(respone); controller phản hồi.
