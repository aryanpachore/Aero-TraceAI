// backend/services/aiService.js
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateAttributionInsight(zone, reading) {
  console.log(`[AI Agent] Analyzing sources for ${zone.name}...`);
  
  // The Prompt: We feed the live DB data into the LLM context
  const prompt = `
    You are an expert environmental AI for a smart city dashboard. Analyze the following urban zone and live air quality data to determine the most likely sources of pollution.

    Data Context:
    - Zone Name: ${zone.name}
    - Zone Type: ${zone.type} (Heavily weight this in your logic)
    - Current AQI: ${reading.aqi}
    - PM2.5 Level: ${reading.pm25} µg/m³
    - PM10 Level: ${reading.pm10} µg/m³
    - Wind Speed: ${reading.windSpeed} km/h

    Task: Return a strict JSON object representing the pollution attribution and an action plan. Do not include any markdown or text outside the JSON.
    
    Expected JSON Format:
    {
      "sourceBreakdown": {
        "traffic": <number 0-100>,
        "industry": <number 0-100>,
        "construction_dust": <number 0-100>,
        "waste_burning": <number 0-100>
      },
      "confidenceScore": <number 0-100>,
      "recommendedAction": "<String: A concise, 3-step prioritized checklist for municipal enforcement officers based on the highest contributing source.>"
    }
    Note: The sourceBreakdown values must sum to 100.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant', // Fast, efficient model
      response_format: { type: 'json_object' }, // Forces strict JSON output
      temperature: 0.2, // Low temperature for analytical consistency
    });

    // Parse the JSON string returned by Groq into a JavaScript object
    const result = JSON.parse(chatCompletion.choices[0].message.content);
    return result;

  } catch (error) {
    console.error('[AI Agent] Groq API Error:', error);
    throw error;
  }
}