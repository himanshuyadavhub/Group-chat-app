const { Sequelize } = require('sequelize');
const bcrypt= require('bcrypt');

const sequelize = new Sequelize('groupchatapp', 'root', 'Server123', {
  host: 'localhost',
  dialect: 'mysql'
});

async function checkingDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
}



checkingDbConnection();



module.exports = sequelize;