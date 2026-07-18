// backend/server.js
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Local ES Module imports (must include .js)
import { sequelize, Zone } from './models/index.js'; 
import { fetchAirQualityData } from './services/ingestionService.js';
import { register, login } from './controllers/authController.js'; 
// <-- UPDATED IMPORT TO INCLUDE getOptimizedRoutes
import { getZoneInsights, getOptimizedRoutes } from './controllers/analyticsController.js'; 
import { getZoneAdvisories } from './controllers/advisoryController.js'; 
import { submitCitizenAlert, getAllAlerts, upload } from './controllers/alertController.js'; 
import { getLocalDashboardData } from './controllers/locationController.js';
import { logIntervention, getInterventionsByZone } from './controllers/interventionController.js'; 

dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Expose the uploads folder to the frontend to serve citizen images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---

// Authentication Routes (Manual Email/Password)
app.post('/api/auth/register', register);
app.post('/api/auth/login', login); 

// Analytics & AI Routes
app.get('/api/insights/:zoneId', getZoneInsights); 
app.get('/api/routes/optimize', getOptimizedRoutes); // <-- NEW ROUTE ADDED HERE
app.get('/api/advisories/:zoneId', getZoneAdvisories); 

// Citizen App Routes
app.post('/api/alerts', upload.single('image'), submitCitizenAlert); 
app.get('/api/dashboard/local', getLocalDashboardData); 

// Admin App Routes
app.get('/api/alerts', getAllAlerts); 
app.post('/api/interventions', logIntervention); 
app.get('/api/interventions/:zoneId', getInterventionsByZone); 

// --- Initialize Database & Start Server ---
sequelize.sync({ alter: true }).then(async () => {
  console.log('✅ MySQL Database synchronized.');

  // Seed initial Zones if the database is empty (Targeting Bhopal locations)
  const zoneCount = await Zone.count();
  if (zoneCount === 0) {
    await Zone.bulkCreate([
      { name: 'Govindpura Industrial Area', type: 'Industrial', centerLat: 23.2500, centerLng: 77.4500 },
      { name: 'Arera Colony', type: 'Residential', centerLat: 23.2100, centerLng: 77.4300 }
    ]);
    console.log('🌱 Seeded initial Zones.');
  }

  // Schedule Data Ingestion (Runs every hour at minute 0)
  cron.schedule('0 * * * *', () => {
    fetchAirQualityData();
  });
  
  // For development, trigger a fetch immediately upon startup
  fetchAirQualityData();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Aero TraceAI Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});