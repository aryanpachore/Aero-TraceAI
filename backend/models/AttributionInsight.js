import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AttributionInsight = sequelize.define('AttributionInsight', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sourceBreakdown: { type: DataTypes.JSON, allowNull: false },
  confidenceScore: { type: DataTypes.FLOAT },
  recommendedAction: { type: DataTypes.TEXT }
});

export default AttributionInsight;