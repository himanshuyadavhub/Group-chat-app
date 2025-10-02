const jwt= require("jsonwebtoken");
const Users= require("../model/User");
const responses= require("../utils/responses");
require("dotenv").config();

async function authentication(req,res,next){
    try {
        const token= req.headers.token;

        if(!token){
            return res.redirect("/user/login")
        }
        const decoded= jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId= decoded.userId;
        
        const user= await Users.findByPk(userId);
    
        if(user){
            req.userId= userId;
            req.phoneNumber= user.phoneNumber;
            next();
        }else{
            return responses.notAuthorized(res, "User Not Authorized!");
        }
    } catch (error) {
        console.log("Error: authentication --", error.message);
        return responses.serverError(res, "Authentication failed!");
    }
}

module.exports= {authentication};