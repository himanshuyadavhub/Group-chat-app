const responses = require("../utils/responses");
const path = require('path');
const { Messages, Users, ArchiveMessages } = require("../model/Associations");
const s3Services = require("../services/s3Services");

function renderChatInboxPage(req, res) {
    try {
        const pathName = path.join(__dirname, "../public/views/inbox.html");
        res.sendFile(pathName);

    } catch (error) {
        console.log("Error: renderChatInboxPage", error.message);
        return responses.serverError(res, "Failed to load inbox");
    }
}

function handleMessages(io, socket) {
    const userId = socket.userId;
    const phoneNumber = socket.senderPhone;
    const senderName = socket.senderName;
    try {
        socket.on("chat-message", async (msg, callback) => {
            const { messageContent, fileUrl } = msg;
            let savedFile = null;
            let savedMessage = null;

            if (fileUrl) {
                savedFile = await Messages.create({ isFile: true, content: fileUrl, userId, from: phoneNumber });
            }

            if (messageContent) {
                savedMessage = await Messages.create({ content: msg.messageContent, from: phoneNumber, userId });
            }
            if (savedMessage || fileUrl) {
                callback({ success: true });
                socket.to("chat-room").emit("message-received", { senderName, messageContent, fileUrl });
            } else {
                callback({ success: false });
            }
        })
    } catch (error) {
        console.error("Error: handleMessages --- ", error);
        callback({ success: false, error: "Failed to process message!" });
    }
}

async function getPreviousMessages(req, res) {
    try {
        const { page = 1 } = req.query;
        const senderId = req.userId;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const sender = await Users.findByPk(senderId);
        if (!sender) {
            return responses.notFound(res, `Sender with user id ${senderId} not found!`);
        }

        let prevMessages = await Messages.findAll({
            include: [{ model: Users, attributes: ['name'] }],
            order: [["createdAt", "DESC"]],
            limit,
            offset
        });
        if (prevMessages.length > 0) {
            return responses.ok(res, `${prevMessages.length} Previous Messages found`, prevMessages);
        } else {
            return responses.ok(res, "No messages found", []);
        }
    } catch (error) {
        console.log("Error: getPreviousMessages -- ", error.message);
        return responses.serverError(res, "Fetching previous messages failed!");
    }
}

async function getArchiveMessages(req, res) {
    const { page = 1 } = req.query;
    const senderId = req.userId;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {

        const sender = await Users.findByPk(senderId);
        if (!sender) {
            return responses.notFound(res, `Sender with user id ${senderId} not found!`);
        }

        const archiveMessages = await ArchiveMessages.findAll(
            {
                include: [{ model: Users, attributes: ['name'] }],
                order: [["createdAt", "DESC"]],
                limit,
                offset
            }
        )
        if (archiveMessages.length > 0) {
            return responses.ok(res, `${archiveMessages.length} Archive Messages found`, archiveMessages);
        } else {
            return responses.ok(res, "No messages found", []);
        }
    } catch (error) {
        console.log("Error: getArchiveMessages -- ", error.message);
        return responses.serverError(res, "Fetching archived messages failed!");
    }
}

async function getFileUploadUrl(req, res) {
    const { fileName, contentType } = req.body;
    try {
        const uniqueFileName = `chat-${Date.now()}-${fileName}`;
        const { uploadUrl, fileUrl } = await s3Services.getUploadUrl(uniqueFileName, contentType);
        return responses.ok(res, "File Upload URL created!", { uploadUrl, fileUrl });
    } catch (error) {
        console.log("Error: getFileUploadUrl --- ", error.message);
        return responses.serverError(res, "File upload Url was not generated...");
    }
}

module.exports = {
    renderChatInboxPage,
    handleMessages,
    getPreviousMessages,
    getArchiveMessages,
    getFileUploadUrl
}