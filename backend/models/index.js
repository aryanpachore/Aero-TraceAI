// backend/models/index.js
import sequelize from '../config/database.js';
import Zone from './Zone.js';
import SensorReading from './SensorReading.js';
import User from './User.js';
import AttributionInsight from './AttributionInsight.js';
import Advisory from './Advisory.js';
import CitizenAlert from './CitizenAlert.js';
import InterventionLog from './InterventionLog.js'; // <-- NEW IMPORT

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

// User <-> CitizenAlert (To track who uploaded the photo)
User.hasMany(CitizenAlert, { foreignKey: 'userId' });
CitizenAlert.belongsTo(User, { foreignKey: 'userId' });

// Zone <-> InterventionLog (To track compliance and actions per zone)
Zone.hasMany(InterventionLog, { foreignKey: 'zoneId' }); // <-- NEW RELATIONSHIP
InterventionLog.belongsTo(Zone, { foreignKey: 'zoneId' }); // <-- NEW RELATIONSHIP

export {
  sequelize,
  Zone,
  SensorReading,
  User,
  AttributionInsight,
  Advisory,
  CitizenAlert,
  InterventionLog // <-- EXPORTED
};