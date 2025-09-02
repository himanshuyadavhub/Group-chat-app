const express = require('express');
const app = express();
const PORT = 3000;
const sequelize= require("./utils/db-connection");
const userRoutes= require('./routes/user-routes');
const messagesRoute= require('./routes/messages-routes');


app.use(express.json());
app.use(express.static('public'));

app.get("/", (req,res) => {
    res.redirect("/user/login");
})

app.use("/user", userRoutes);
app.use("/message", messagesRoute);


async function syncDatabase() {
  try {
    await sequelize.sync(); // Creates tables if they don't exist
    console.log('Database synchronized successfully!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();



app.listen(PORT, function(err){
    if(err){
        console.log("Server running failed!", err.message);
        return
    }
    console.log(`server is running on http://localhost:${PORT}`);
})