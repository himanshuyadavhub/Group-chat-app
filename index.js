const express = require('express');
const app = express();
const PORT = 3000;


app.get("/", (req,res)=> {
    res.send("Server running fine!")
})


app.listen(PORT, function(err){
    if(err){
        console.log("Server running failed!", err.message);
        return
    }
    console.log(`server is running on http://localhost:${PORT}`);
})