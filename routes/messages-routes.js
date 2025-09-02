const express = require('express');
const router= express.Router();
const {authentication}= require("../middleware/auth");
const messagesController= require("../controller/messages-controller");

router.get("/", authentication , messagesController.renderChatInboxPage);
router.post("/send", authentication, messagesController.sendMessage);


module.exports = router;