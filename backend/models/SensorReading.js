// backend/models/SensorReading.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SensorReading = sequelize.define('SensorReading', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  aqi: { type: DataTypes.INTEGER, allowNull: false },
  pm25: { type: DataTypes.FLOAT, allowNull: false },
  pm10: { type: DataTypes.FLOAT, allowNull: false },
  windSpeed: { type: DataTypes.FLOAT },
  windDeg: { type: DataTypes.INTEGER },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default SensorReading;