const jwt = require("jsonwebtoken");
const  Users  = require("../model/User");
const responses = require("../utils/responses");
require("dotenv").config();



async function socketAuthentication(socket, next) {
    const token = socket.handshake.auth.token;
    try {
        if (!token) {
            return next(new Error("Authentication error: No token"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userId;

        const user = await Users.findByPk(userId);

        if (user) {
            socket.userId = userId;
            socket.senderPhone= user.phoneNumber;
            socket.senderName= user.name;
            next();
        } else {
            next(new Error("Authentication error: No user found."));
        }

    } catch (error) {
        console.log("Error: socketAuthentication --", error.message);
        return next(new Error("Authentication error: Server error"));
    }
}

module.exports= {
    socketAuthentication
}