// backend/controllers/advisoryController.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Zone, SensorReading } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getZoneAdvisories = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { vulnerability = 'General Public', language = 'English' } = req.query;

    // FIXED: Order by 'createdAt' instead of 'readingTime'
    const latestReading = await SensorReading.findOne({
      where: { zoneId },
      order: [['createdAt', 'DESC']],
      include: [Zone]
    });

    if (!latestReading) {
      return res.status(404).json({ error: "No environmental data available for this zone." });
    }

    console.log(`[Gemini Agent 3] Generating ${language} advisory for profile: ${vulnerability}...`);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    const prompt = `
      You are an expert Public Health & Environmental Advisory AI for a smart city dashboard.
      Your task is to generate a localized, context-aware health advisory based on live air quality metrics.

      Current Environmental Data for ${latestReading.Zone.name}:
      - AQI: ${latestReading.aqi}
      - PM2.5: ${latestReading.pm25} µg/m³
      - PM10: ${latestReading.pm10} µg/m³
      
      Citizen Profile:
      - Vulnerability Status: ${vulnerability}
      
      Instructions:
      1. Analyze the pollutants against standard WHO thresholds.
      2. Generate specific, actionable health tips strictly tailored to a person with the "${vulnerability}" profile.
      3. Translate the entire response into the following language: ${language}.
      
      Return ONLY a strict JSON object. No markdown, no backticks.
      Expected Format:
      {
        "aqiCategory": "Good / Moderate / Unhealthy / Severe",
        "healthWarning": "A 1-2 sentence urgent warning tailored to the vulnerability.",
        "recommendedAction": "A specific action the citizen should take right now."
      }
    `;

    const result = await model.generateContent(prompt);
    let rawOutput = result.response.text();
    
    rawOutput = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiAdvisory = JSON.parse(rawOutput);

    res.status(200).json({
      zoneName: latestReading.Zone.name,
      vulnerabilityProfile: vulnerability,
      language: language,
      advisory: aiAdvisory
    });

  } catch (error) {
    console.error('❌ [Gemini Agent 3] Advisory generation failed:', error);
    res.status(500).json({ error: "Failed to generate citizen health advisory." });
  }
};