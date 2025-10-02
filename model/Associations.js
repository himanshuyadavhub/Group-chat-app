const Users= require("./User");
const Messages= require("./Messages");
const ActiveConnections= require("./ActiveConnections");
const ArchiveMessages= require('./ArchiveMessages');



Users.hasMany(Messages, {foreignKey:"userId"});
Messages.belongsTo(Users, {foreignKey: "userId"});

Users.hasOne(ActiveConnections, {foreignKey:"userId"});
ActiveConnections.belongsTo(Users, {foreignKey: "userId"});

Users.hasMany(ArchiveMessages, {foreignKey:"userId"});
ArchiveMessages.belongsTo(Users, {foreignKey: "userId"});


module.exports={
    Users,
    Messages,
    ActiveConnections,
    ArchiveMessages
}