const {Sequelize}= require('sequelize');

const sequelize = new Sequelize('chatapp', 'root', 'Server123', {
  host: 'localhost',
  dialect: 'mysql',
  logging:false
});

async function checkingDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('DB Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
}



checkingDbConnection();



module.exports = sequelize;