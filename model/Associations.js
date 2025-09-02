const Users= require("./users");
const Messages= require("./messages");



Users.hasMany(Messages, {foreignKey:"userId"});
Messages.belongsTo(Users, {foreignKey: "userId"});


module.exports={
    Users,
    Messages
}