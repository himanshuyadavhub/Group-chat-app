const express= require('express');
const router= express.Router();
const {authentication}= require("../middleware/auth");
const messageController= require("../controller/message-controlller");


router.get("/inbox", messageController.renderChatInboxPage);
router.get("/previous", authentication, messageController.getPreviousMessages);
router.get("/archive", authentication, messageController.getArchiveMessages);


router.post("/file/presignedurl", authentication, messageController.getFileUploadUrl)

module.exports= router;