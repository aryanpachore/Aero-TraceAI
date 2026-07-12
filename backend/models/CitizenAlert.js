import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CitizenAlert = sequelize.define('CitizenAlert', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING, allowNull: false }, // e.g., 'Waste Burning'
  severity: { type: DataTypes.INTEGER, allowNull: false },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
  imageUrl: { type: DataTypes.STRING },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
});

export default CitizenAlert;