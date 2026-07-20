import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Admin = sequelize.define('Admin', {
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
  city: {
    type: DataTypes.STRING,
    allowNull: false // Admins must have a jurisdiction
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin'
  }
});

export default Admin;