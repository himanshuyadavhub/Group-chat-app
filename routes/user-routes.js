const express = require('express');
const router= express.Router();
const userController= require("../controller/user-controller");

router.get("/signup", userController.renderSignupPage);
router.post("/signup", userController.createUser);

module.exports = router;