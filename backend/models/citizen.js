import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Importing your DB connection directly

const Citizen = sequelize.define('Citizen', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  healthProfile: {
    type: DataTypes.STRING,
    defaultValue: 'General Public'
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'citizen'
  }
});

export default Citizen;