// backend/controllers/alertController.js
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Zone, CitizenAlert } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Configure Multer to store the incoming image in memory (faster for AI processing)
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

// Helper: Haversine distance formula to find the closest zone
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

export const submitCitizenAlert = async (req, res) => {
  try {
    const { lat, lng, userId } = req.body;
    const file = req.file;

    if (!file || !lat || !lng) {
      return res.status(400).json({ error: "Image, latitude, and longitude are required." });
    }

    console.log('[Vision Agent] Analyzing uploaded image...');

    // 2. Prepare the image for Gemini
    const imagePart = {
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype
      }
    };

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const prompt = `
      Analyze this image. Is there active environmental pollution occurring? Look for factory smoke, open waste burning, or severe construction dust.
      Return ONLY a strict JSON object. No markdown, no backticks.
      Expected Format:
      {
        "isPolluting": true/false,
        "type": "Waste Burning" (or "Dust", "Smoke", "None"),
        "severity": 1-10
      }
    `;

    // 3. Call Gemini Vision
    const result = await model.generateContent([prompt, imagePart]);
    let rawOutput = result.response.text();
    rawOutput = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiAnalysis = JSON.parse(rawOutput);

    if (!aiAnalysis.isPolluting) {
      return res.status(200).json({ message: "Image processed. No pollution detected. Alert discarded." });
    }

    // 4. Find the closest Zone using the Haversine formula
    const zones = await Zone.findAll();
    let closestZone = null;
    let shortestDistance = Infinity;

    zones.forEach(zone => {
      const distance = getDistanceFromLatLonInKm(lat, lng, zone.centerLat, zone.centerLng);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestZone = zone;
      }
    });

    if (!closestZone) {
      return res.status(404).json({ error: "No monitoring zones found near this location." });
    }

    // 5. Save the verified alert to the database
    const newAlert = await CitizenAlert.create({
      zoneId: closestZone.id,
      userId: userId || null, // Nullable if they didn't log in
      type: aiAnalysis.type,
      severity: aiAnalysis.severity,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      isVerified: true, // Automatically verified by AI!
      imageUrl: 'local_upload' // In a real production app, you'd upload the buffer to AWS S3 here
    });

    res.status(201).json({
      message: `Pollution verified! Alert assigned to ${closestZone.name}.`,
      alert: newAlert
    });

  } catch (error) {
    console.error('[Vision Agent] Error:', error);
    res.status(500).json({ error: "Failed to process citizen alert." });
  }
};