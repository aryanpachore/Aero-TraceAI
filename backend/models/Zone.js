// backend/models/Zone.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Zone = sequelize.define('Zone', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  centerLat: { type: DataTypes.FLOAT, allowNull: false },
  centerLng: { type: DataTypes.FLOAT, allowNull: false },
});

export default Zone;