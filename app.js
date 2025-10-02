const express = require('express');
const app = express();
const { createServer } = require("http")
const server = createServer(app);

const { Server } = require('socket.io');
const { socketAuthentication } = require("./middleware/socket-auth");
const {ActiveConnections} = require("./model/Associations");

const sequelize = require("./utils/db-connection");
const userRoutes = require("./routes/user-routes");
const messageRoutes = require("./routes/message-routes");
const messageController = require("./controller/message-controlller");
require("./jobs/archivejobs");

async function syncDatabase() {
    try {
        await sequelize.sync(); // Creates tables if they don't exist
        console.log('Database synchronized successfully!');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
}

syncDatabase();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => res.redirect("/user/login"))
app.use("/user", userRoutes);
app.use("/message", messageRoutes);

const io = new Server(server);

io.use(socketAuthentication);

io.on('connection', async (socket) => {
    socket.join("chat-room");
    const [connection, newConnection] = await ActiveConnections.upsert({
        socketId: socket.id,
        phoneNumber: socket.senderPhone,
        isOnline:true,
        userId:socket.userId
    });

    if (newConnection) {
        console.log('New connection created + ', socket.senderName);
    } else {
        console.log('Existing Connection updated + ', socket.senderName);
    }
    socket.to("chat-room").emit("room-joined", { newJoinee: socket.senderName, phoneNumber:socket.senderPhone });

    messageController.handleMessages(io, socket);
    socket.on('disconnect', async() => {
        const connection= await ActiveConnections.findOne({where:{
            socketId:socket.id
        }})
        connection.isOnline= false;
        await connection.save();
        socket.to("chat-room").emit("room-left", { leftJoinee: socket.senderName, phoneNumber:socket.senderPhone })
    });
});




server.listen(3000, () => {
    console.log("App is runnning on 3000")
})