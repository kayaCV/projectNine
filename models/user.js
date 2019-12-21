'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
      // id (Integer, primary key, auto-generated)
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    // firstName (String)
    firstName: Sequelize.STRING,
    // lastName (String)
    lastName: Sequelize.STRING,
    // emailAddress (String)
    emailAddress: {
      type: Sequelize.STRING,
    },
    // password (String)
    password: Sequelize.STRING,

}, { sequelize });

    return User;
}

User.associate = (models) => {
    User.hasMany(models.Course, { 
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      } 
    });
  };




