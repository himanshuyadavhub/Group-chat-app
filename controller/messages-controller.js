const responses = require("../utils/responses");
const path = require('path');
const { Users, Messages } = require("../model/Associations");
const { send } = require("process");
const { response } = require("express");


function renderChatInboxPage(req, res) {
    try {
        const pathName = path.join(__dirname, "../public/views/chatinbox.html");
        res.sendFile(pathName);

    } catch (error) {
        console.log("Error: renderChatInboxPage", error.message);
        return responses.serverError(res, "Failed to load inbox");
    }
}

async function sendMessage(req, res) {
    const { messageContent } = req.body;
    const userId = req.userId;
    try {
        const user = await Users.findByPk(userId);
        if (!user) {
            return responses.notFound(res, `User with user id ${userId} not found!`);
        }

        const savedMessage = await Messages.create({ content: messageContent, userId });
        return responses.created(res, "Message saved to DB!", savedMessage);
    } catch (error) {
        console.log("Error: sendMessage", error.message);
        return responses.serverError(res, "Message failed, Something went wrong!");
    }
}

async function getPreviousMessages(req, res) {
    try {
        const userId = req.userId;
        const user = await Users.findByPk(userId);
        if (!user) {
            return responses.notFound(res, `User with user id ${userId} not found!`);
        }
        const prevMessages = await Messages.findAll({ where: { userId } });
    
        if (prevMessages.length > 0) {
            return responses.ok(res, "Messages found", prevMessages);
        }else{
            return response.ok(res, "No messages found", []);
        }
    } catch (error) {
        console.log("Error: getPreviousMessages -- ", error.message);
        return responses.serverError(res, "Fetching previous messages failed!");
    }

}


module.exports = {
    renderChatInboxPage,
    sendMessage,
    getPreviousMessages
}