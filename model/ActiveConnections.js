const {Sequelize, DataTypes}= require('sequelize');
const sequelize= require('../utils/db-connection');

const ActiveConnections= sequelize.define("ActiveConnections", {
    socketId:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    phoneNumber:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        primaryKey:true
    },
    isOnline:{
        type:DataTypes.BOOLEAN,
        required:true
    }

})


module.exports= ActiveConnections