import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Advisory = sequelize.define('Advisory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  targetProfile: { type: DataTypes.STRING, allowNull: false }, // e.g., 'Asthmatic', 'Standard'
  language: { type: DataTypes.STRING, allowNull: false }, // e.g., 'en', 'hi', 'mr'
  message: { type: DataTypes.TEXT, allowNull: false }
});

export default Advisory;