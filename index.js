const express = require('express');
const app = express();
const PORT = 3000;
const userRoutes= require('./routes/user-routes');

app.use(express.json());
app.use(express.static('public'));

app.get("/", (req,res) => {
    res.redirect("/user/signup");
})

app.use("/user", userRoutes)


app.listen(PORT, function(err){
    if(err){
        console.log("Server running failed!", err.message);
        return
    }
    console.log(`server is running on http://localhost:${PORT}`);
})