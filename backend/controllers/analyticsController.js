// backend/controllers/analyticsController.js
import Groq from 'groq-sdk';
import { Zone, SensorReading, CitizenAlert } from '../models/index.js'; // <-- ADDED CitizenAlert
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getZoneInsights = async (req, res) => {
  try {
    const { zoneId } = req.params;

    // FIXED: Order by 'createdAt' instead of 'readingTime'
    const latestReading = await SensorReading.findOne({
      where: { zoneId },
      order: [['createdAt', 'DESC']], 
      include: [Zone]
    });

    if (!latestReading) {
      return res.status(404).json({ error: "Telemetry profiles not found for the requested tracking zone." });
    }

    console.log(`[Groq Agent 1] Initiating source fingerprinting model optimization for: ${latestReading.Zone.name}...`);
    
    const systemPrompt = `
      You are an advanced City Environmental Data Science Agent specializing in Geospatial Source Attribution. 
      Your task is to analyze sensor metrics against meteorological vectors and land configurations to isolate emission culprits.
      
      You MUST respond with a strict, raw JSON object ONLY. Do not include markdown wraps, backticks (\`\`\`), or preambles.
      
      Expected Response Blueprint:
      {
        "aqiIndex": 185,
        "primaryCulprit": "String identifying root vehicle/factory asset class",
        "confidenceBreakdown": {
          "traffic": 65,
          "industrial": 20,
          "dust": 15
        },
        "anomalyDetected": true/false,
        "aiSummary": "Comprehensive detailed paragraph explaining the exact correlation between wind speed, specific gas ratios (NO2/SO2), and local urban activities."
      }
    `;

    const userContext = `
      Zone Monitored: ${latestReading.Zone.name}
      Zone Typology: ${latestReading.Zone.type}
      
      Current Particle Densities:
      - AQI: ${latestReading.aqi}
      - PM2.5: ${latestReading.pm25} µg/m³
      - PM10: ${latestReading.pm10} µg/m³
      
      Current Weather Dispersion Factors:
      - Wind Velocity: ${latestReading.windSpeed} km/h
      - Plume Vector Direction (Degrees): ${latestReading.windDeg}°
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContext }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.2,
    });

    let rawOutput = chatCompletion.choices[0].message.content.trim();
    
    if (rawOutput.startsWith('```')) {
      rawOutput = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const structuredInsights = JSON.parse(rawOutput);
    res.status(200).json(structuredInsights);

  } catch (error) {
    console.error('❌ [Groq Agent 1] Attribution model failure:', error);
    res.status(500).json({ error: "Attribution engine failed to isolate localized root causes." });
  }
};

// --- AGENT 2: PROACTIVE ENFORCEMENT PLANNER ---
export const getOptimizedRoutes = async (req, res) => {
  try {
    console.log('[Groq Agent 2] Initiating city-wide inspector route optimization...');

    // Fetch all currently active, unresolved hotspots
    const activeAlerts = await CitizenAlert.findAll({
      where: { status: 'Pending Verification' },
      order: [['intensity', 'DESC']],
      limit: 10 // Analyze the top 10 worst zones
    });

    if (activeAlerts.length === 0) {
      return res.status(200).json({ actionPlan: [] });
    }

    // Format the data for Groq
    const hotspotData = activeAlerts.map(alert => ({
      location: alert.locationName,
      intensity: alert.intensity,
      coordinates: `${alert.latitude}, ${alert.longitude}`
    }));

    const systemPrompt = `
      You are an elite Municipal Enforcement AI. 
      Your job is to analyze active pollution hotspots and generate a prioritized daily deployment route for city inspectors.
      
      Analyze the provided JSON array of hotspots. Prioritize them based on 'intensity'.
      Return ONLY a strict JSON object with a top 3 action plan. No backticks, no markdown.
      
      Expected Response Blueprint:
      {
        "actionPlan": [
          {
            "priority": 1,
            "location": "Name of location",
            "action": "Specific instruction (e.g., Deploy water bowser, dispatch traffic police)",
            "reasoning": "Brief 1-sentence logic for why this is top priority."
          }
        ]
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(hotspotData) }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.1,
    });

    let rawOutput = chatCompletion.choices[0].message.content.trim();
    if (rawOutput.startsWith('```')) {
      rawOutput = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    res.status(200).json(JSON.parse(rawOutput));

  } catch (error) {
    console.error('❌ [Groq Agent 2] Action Planner failure:', error);
    res.status(500).json({ error: "Failed to generate optimized deployment routes." });
  }
};