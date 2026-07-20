// backend/models/index.js
import sequelize from '../config/database.js';
import Zone from './Zone.js';
import SensorReading from './SensorReading.js';
import Citizen from './citizen.js'; // <-- REPLACED User.js
import Admin from './admin.js';     // <-- NEW IMPORT
import AttributionInsight from './AttributionInsight.js';
import Advisory from './Advisory.js';
import CitizenAlert from './CitizenAlert.js';
import InterventionLog from './InterventionLog.js';

// --- Define Database Relationships ---

// Zone <-> SensorReading
Zone.hasMany(SensorReading, { foreignKey: 'zoneId' });
SensorReading.belongsTo(Zone, { foreignKey: 'zoneId' });

// Zone <-> AttributionInsight
Zone.hasMany(AttributionInsight, { foreignKey: 'zoneId' });
AttributionInsight.belongsTo(Zone, { foreignKey: 'zoneId' });

// Zone <-> Advisory
Zone.hasMany(Advisory, { foreignKey: 'zoneId' });
Advisory.belongsTo(Zone, { foreignKey: 'zoneId' });

// Zone <-> CitizenAlert
Zone.hasMany(CitizenAlert, { foreignKey: 'zoneId' });
CitizenAlert.belongsTo(Zone, { foreignKey: 'zoneId' });

// Citizen <-> CitizenAlert (To track which citizen uploaded the photo)
Citizen.hasMany(CitizenAlert, { foreignKey: 'userId' }); // Kept 'userId' to prevent DB migration errors
CitizenAlert.belongsTo(Citizen, { foreignKey: 'userId' });

// Zone <-> InterventionLog (To track compliance and actions per zone)
Zone.hasMany(InterventionLog, { foreignKey: 'zoneId' });
InterventionLog.belongsTo(Zone, { foreignKey: 'zoneId' });

export {
  sequelize,
  Zone,
  SensorReading,
  Citizen, // <-- EXPORTED NEW MODEL
  Admin,   // <-- EXPORTED NEW MODEL
  AttributionInsight,
  Advisory,
  CitizenAlert,
  InterventionLog
};