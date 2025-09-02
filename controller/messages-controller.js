const responses = require("../utils/responses");
const path = require('path');
const {Users, Messages} = require("../model/Associations");
const { send } = require("process");
const { response } = require("express");


function renderChatInboxPage(req,res){
    try {
        const pathName= path.join(__dirname, "../public/views/chatinbox.html");
        res.sendFile(pathName);
        
    } catch (error) {
        console.log("Error: renderChatInboxPage", error.message);
        return responses.serverError(res, "Failed to load inbox");
    }
}

async function sendMessage(req,res){
    const {messageContent} = req.body;
    const userId= req.userId;
    try {
        const user= await Users.findByPk(userId);
        if(!user){
            return responses.notFound(res, `User with user id ${userId} not found!`);
        }

        const savedMessage= await Messages.create({content:messageContent, userId});
        return responses.created(res, "Message saved to DB!", savedMessage);
    } catch (error) {
        console.log("Error: sendMessage", error.message);
        return responses.serverError(res, "Message failed, Something went wrong!");
    }
}


module.exports= {
    renderChatInboxPage,
    sendMessage
}