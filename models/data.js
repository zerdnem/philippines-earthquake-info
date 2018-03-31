'use strict';
module.exports = (sequelize, DataTypes) => {
  var data = sequelize.define('data', {
    day: DataTypes.STRING,
    date: DataTypes.DATE,
    latitude: DataTypes.INTEGER,
    longitude: DataTypes.INTEGER,
    depth: DataTypes.INTEGER,
    magnitude: DataTypes.INTEGER,
    location: DataTypes.STRING
  }, {});
  data.associate = function(models) {
    // associations can be defined here
  };
  return data;
};