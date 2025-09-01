const responses = require("../utils/responses");
const path = require('path');

const Users = require("../model/users");

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

        let user = await Users.findOne({ where: { email } });
        if (user) {
            responses.badRequest(res, "Email already used!");
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

        const createdUser= await Users.create(user);
        responses.created(res, "New User created!", user);
        return
    } catch (error) {
        console.log("Error: createUser", error.message);
        return responses.serverError("New User Creation failed!");
    }

}

module.exports = {
    renderSignupPage,
    createUser
}