// backend/models/InterventionLog.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const InterventionLog = sequelize.define('InterventionLog', {
  actionTaken: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., "Deployed Smog Gun", "Traffic Diversion Active"
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  loggedBy: {
    type: DataTypes.STRING,
    defaultValue: 'Admin Officer',
  }
});

export default InterventionLog;