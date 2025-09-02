const {Sequelize, DataTypes}= require('sequelize');
const sequelize= require('../utils/db-connection');

const Messages= sequelize.define("Messages", {
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    content:{
        type:DataTypes.STRING,
        allowNull:false
    }
})


module.exports= Messages