const responses = require("../utils/responses");
const path = require('path');
const { Users, Messages } = require("../model/Associations");
const { Op } = require('sequelize');
const s3Services= require("../services/s3Services")



function renderChatInboxPage(req, res) {
    try {
        const pathName = path.join(__dirname, "../public/views/chatinbox.html");
        res.sendFile(pathName);

    } catch (error) {
        console.log("Error: renderChatInboxPage", error.message);
        return responses.serverError(res, "Failed to load inbox");
    }
}

async function saveMessage(req, res) {
    const { messageContent, receiverPhone } = req.body;
    
    const userId = req.userId;
    try {
        const sender = await Users.findByPk(userId);
        if (!sender) {
            return responses.notFound(res, `Sender with user id ${userId} not found!`);
        }

        const receiver = await Users.findAll({ where: { phoneNumber: receiverPhone } });

        if (!receiver) {
            return responses.notFound(res, `Receiver with Phone Number  ${receiverPhone} not found!`);
        }

        const savedMessage = await Messages.create({ content: messageContent, userId, to: receiverPhone, from: sender.phoneNumber });
        return responses.created(res, "Message saved to DB!", savedMessage);

    } catch (error) {
        console.log("Error: sendMessage", error.message);
        return responses.serverError(res, "Message failed, Something went wrong!");
    }
}


async function getFileUploadUrl(req,res){
    const {fileName, contentType}= req.body;
    try {
        const uniqueFileName= `chat-${Date.now()}-${fileName}`;
        const {uploadUrl, fileUrl}=  await s3Services.getUploadUrl(uniqueFileName, contentType);
        return responses.ok(res, "File Upload URL created!", {uploadUrl, fileUrl});
    } catch (error) {
        console.log("Error: getFileUploadUrl --- ", error.message);
        return responses.serverError(res, "File upload Url was not generated...");
    }
}

async function getPreviousMessages(req, res) {
    try {
        const { receiverPhone } = req.query;
        const senderId = req.userId;
        const sender = await Users.findByPk(senderId);
        if (!sender) {
            return responses.notFound(res, `Sender with user id ${senderId} not found!`);
        }
        const receiver = await Users.findOne({ where: { phoneNumber: receiverPhone } });
        if (!receiver) {
            return responses.notFound(res, `Receiver with Phone Number ${receiverPhone} not found!`);
        }

        const prevMessages = await Messages.findAll({
            where: {
                [Op.or]: [
                    {
                        to: receiverPhone,
                        from: sender.phoneNumber
                    },
                    {
                        to:sender.phoneNumber,
                        from:receiverPhone
                    }
                ]
            },
            order:[["createdAt","DESC"]]
        });
        if (prevMessages.length > 0) {
            return responses.ok(res, "Messages found", prevMessages);
        } else {
            return responses.ok(res, "No messages found", []);
        }
    } catch (error) {
        console.log("Error: getPreviousMessages -- ", error.message);
        return responses.serverError(res, "Fetching previous messages failed!");
    }
}

async function saveFile(req, res) {
    const { fileUrl, receiverPhone } = req.body;
    
    const userId = req.userId;
    try {
        const sender = await Users.findByPk(userId);
        if (!sender) {
            return responses.notFound(res, `Sender with user id ${userId} not found!`);
        }

        const receiver = await Users.findAll({ where: { phoneNumber: receiverPhone } });

        if (!receiver) {
            return responses.notFound(res, `Receiver with Phone Number  ${receiverPhone} not found!`);
        }

        const savedFile = await Messages.create({isFile: true, content: fileUrl, userId, to: receiverPhone, from: sender.phoneNumber });
        return responses.created(res, "File saved to DB!", savedFile);

    } catch (error) {
        console.log("Error: sendMessage", error.message);
        return responses.serverError(res, "Message failed, Something went wrong!");
    }
}


module.exports = {
    renderChatInboxPage,
    saveMessage,
    getPreviousMessages,
    getFileUploadUrl,
    saveFile
}