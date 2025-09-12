const responses = require("../utils/responses");
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const { Op } = require('sequelize');

const { Users } = require("../model/Associations");

function renderSignupPage(req, res) {
    try {
        const pathName = path.join(__dirname, '../public/views/signup.html');
        res.sendFile(pathName)
    } catch (error) {
        console.log("Error: renderSignupPage", error.message);
        return responses.notFound(res, "Getting signup page failed!");
    }
}

async function createUser(req, res) {
    const { name, email, phoneNumber, password, confirmPassword } = req.body;
    try {
        if (password !== confirmPassword) {
            responses.badRequest(res, "Password mismatched!");
            return;
        }
        let user = await Users.findOne({ where: { email } });
        if (user) {
            responses.badRequest(res, "Email already used!");
            return;
        }

        user = await Users.findOne({ where: { phoneNumber } });
        if (user) {
            responses.badRequest(res, "Phone Number already used!");
            return;
        }

        const hash = await bcrypt.hash(password, 10);
        user = {
            name,
            email,
            phoneNumber,
            password: hash,
            confirmPassword
        }

        const createdUser = await Users.create(user);
        responses.created(res, "New User created!", user);
        return
    } catch (error) {
        console.log("Error: createUser", error.message);
        return responses.serverError("New User Creation failed!");
    }

}

function renderLoginPage(req, res) {
    try {
        const pathName = path.join(__dirname, '../public/views/login.html');
        res.sendFile(pathName)
    } catch (error) {
        console.log("Error: renderLoginPage", error.message);
        return responses.notFound(res, "Getting signup page failed!");
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ where: { email } });
        if (!user) {
            responses.notFound(res, "Email id not registered!");
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            responses.notAuthorized(res, "Entered wrong password!");
            return;
        }

        const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY);
        return responses.ok(res, "Login sucessfully!", { jwtToken });
    } catch (error) {
        console.log("Error: loginUser", error.message);
        return responses.serverError(res, "Login user failed!");
    }

}

async function getAllUsers(req, res) {
    const userId = req.userId;
    try {
        const contacts = await Users.findAll({
            where: {
                id: {
                    [Op.ne]: [userId],
                }
            },
            attributes:["name", "email", "phoneNumber"]
        })
        if (contacts.length > 0) {
            return responses.ok(res, "Fetched all contacts", contacts);
        } else {
            return responses.ok(res, "No contact found!", []);
        }
    } catch (error) {
        console.log("Error: getAllUsers -- ", error.message);
        return responses.serverError(res, "Getting all contacts failed!");
    }
}

module.exports = {
    renderSignupPage,
    createUser,
    renderLoginPage,
    loginUser,
    getAllUsers
}