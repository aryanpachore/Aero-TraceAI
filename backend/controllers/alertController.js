// backend/controllers/alertController.js
import multer from 'multer';
import path from 'path';
import { CitizenAlert, Zone } from '../models/index.js';

// Configure Multer for Image Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure you have an 'uploads' folder in your backend root!
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage });

export const submitCitizenAlert = async (req, res) => {
  try {
    const { latitude, longitude, vulnerability } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "GPS coordinates are required to log an alert." });
    }

    // Default intensity for a new alert, to be analyzed by AI later
    const initialIntensity = 75; 

    // Create the alert in the database
    const newAlert = await CitizenAlert.create({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl,
      intensity: initialIntensity,
      status: 'Pending Verification',
      locationName: 'Citizen Reported Hotspot',
      zoneId: 1 // Defaulting to Zone 1 for the demo scope
    });

    res.status(201).json({ message: "Alert successfully transmitted to Command Center.", alert: newAlert });
  } catch (error) {
    console.error("❌ [Alert Engine] Failed to process citizen report:", error);
    res.status(500).json({ error: "Failed to submit alert." });
  }
};

export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await CitizenAlert.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(alerts);
  } catch (error) {
    console.error("❌ [Alert Engine] Failed to fetch alerts:", error);
    res.status(500).json({ error: "Failed to fetch map data." });
  }
};