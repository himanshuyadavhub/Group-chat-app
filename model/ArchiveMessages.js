const {Sequelize, DataTypes}= require('sequelize');
const sequelize= require('../utils/db-connection');

const ArchiveMessages= sequelize.define("ArchiveMessages", {
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    isFile:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    content:{
        type:DataTypes.STRING,
        allowNull:false
    },
    from:{
        type:DataTypes.STRING,
        allowNull:false
    }
})


module.exports= ArchiveMessages