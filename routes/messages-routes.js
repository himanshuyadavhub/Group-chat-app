const express = require('express');
const router= express.Router();
const {authentication}= require("../middleware/auth");
const messagesController= require("../controller/messages-controller");

router.get("/inbox" , messagesController.renderChatInboxPage);
router.post("/send", authentication, messagesController.sendMessage);

router.get("/previous", authentication, messagesController.getPreviousMessages);


module.exports = router;