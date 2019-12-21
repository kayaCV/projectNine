'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    // id (Integer, primary key, auto-generated)
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // userId (id from the Users table)
    // title (String)
    title: Sequelize.STRING,
    // description (Text)
    description: Sequelize.TEXT,
    // estimatedTime (String, nullable)
    estimatedTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    // materialsNeeded (String, nullable)
    materialsNeeded: {
        type: Sequelize.INTEGER,
        allowNull: true,
    }

  }, { sequelize });
  return Course;
}

  Course.associate = (models) => {
    Course.belongsTo(models.User, { 
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }  
    });
  };