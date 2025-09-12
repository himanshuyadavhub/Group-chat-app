const express = require('express');
const router= express.Router();
const {authentication}= require("../middleware/auth");
const messagesController= require("../controller/messages-controller");

router.get("/inbox" , messagesController.renderChatInboxPage);
router.post("/send/text", authentication, messagesController.saveMessage);
router.post("/send/file", authentication, messagesController.saveFile);

router.get("/previous", authentication, messagesController.getPreviousMessages);

router.post("/file/presignedurl", authentication, messagesController.getFileUploadUrl)


module.exports = router;