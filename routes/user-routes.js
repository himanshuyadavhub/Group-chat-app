const express= require('express');
const router= express.Router();
const userController= require("../controller/user-controller");
const {authentication}= require("../middleware/auth");

router.get("/signup", userController.renderSignupPage);
router.post("/signup", userController.createUser);

router.get("/login", userController.renderLoginPage);
router.post("/login", userController.loginUser);

router.get("/active", authentication, userController.getActiveUsers);


module.exports= router;