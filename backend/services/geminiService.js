// backend/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateHealthAdvisories(zone, reading) {
  console.log(`[AI Agent] Generating translations for ${zone.name}...`);
  
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const prompt = `
    You are a strict public health AI for a smart city. The current air quality in ${zone.name} is AQI ${reading.aqi} with PM2.5 at ${reading.pm25}. 
    
    Task: Write a concise, urgent 1-sentence health warning for vulnerable profiles (e.g., asthmatics) based on this data. 
    Then, translate that exact message into English, Hindi, and Marathi.

    Return ONLY a strict JSON object. No markdown, no backticks.
    Expected JSON Format exactly:
    {
      "targetProfile": "Asthmatic and Elderly",
      "advisories": [
        { "language": "en", "message": "English warning text here." },
        { "language": "hi", "message": "Hindi warning text here." },
        { "language": "mr", "message": "Marathi warning text here." }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    let rawOutput = result.response.text();
    
    // Clean markdown backticks
    rawOutput = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(rawOutput);

  } catch (error) {
    // HACKATHON FALLBACK: If Gemini API is busy (503) or fails, return perfect mock data!
    console.warn(`[AI Agent] Gemini API is currently busy or failed. Injecting Fallback Translations for ${zone.name}...`);
    
    return {
      "targetProfile": "General Public (Fallback)",
      "advisories": [
        { "language": "en", "message": "Air quality is currently poor. Sensitive individuals should reduce outdoor exertion." },
        { "language": "hi", "message": "वायु गुणवत्ता वर्तमान में खराब है। संवेदनशील लोगों को बाहरी व्यायाम कम करना चाहिए।" },
        { "language": "mr", "message": "सध्या हवेची गुणवत्ता खराब आहे. संवेदनशील व्यक्तींनी बाहेरील व्यायाम कमी करावा." }
      ]
    };
  }
}