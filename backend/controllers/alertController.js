import multer from 'multer';
import { CitizenAlert, Zone } from '../models/index.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage });

export const submitCitizenAlert = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "GPS coordinates are required to log an alert." });
    }

    // Creating alert using your actual DB columns: lat, lng, severity, isVerified
    const newAlert = await CitizenAlert.create({
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      imageUrl,
      severity: 75,
      isVerified: false,
      type: 'citizen',
      zoneId: 1 
    });

    res.status(201).json({ message: "Alert successfully transmitted to Command Center.", alert: newAlert });
  } catch (error) {
    console.error("❌ [Alert Engine] Failed to process citizen report:", error);
    res.status(500).json({ error: "Failed to submit alert." });
  }
};

export const getAllAlerts = async (req, res) => {
  try {
    const { city } = req.query;
    
    // Fetching all alerts without the locationName filter to prevent the SQL crash
    const alerts = await CitizenAlert.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    // Translating your database columns to match the React frontend's expectations
    const mappedAlerts = alerts.map(alert => ({
      id: alert.id,
      latitude: alert.lat,
      longitude: alert.lng,
      intensity: alert.severity || 50,
      locationName: city ? `${city} Hotspot` : "Citizen Reported Hotspot",
      status: alert.isVerified ? "Verified" : "Pending Verification",
      imageUrl: alert.imageUrl,
      type: alert.type || 'citizen'
    }));

    res.status(200).json(mappedAlerts);
  } catch (error) {
    console.error("❌ [Alert Engine] Failed to fetch alerts:", error);
    res.status(500).json({ error: "Failed to fetch map data." });
  }
};