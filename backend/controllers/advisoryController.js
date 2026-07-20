import Groq from 'groq-sdk';
import { Zone } from '../models/index.js'; 

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const getZoneAdvisories = async (req, res) => {
    try {
        const { zoneId } = req.params;
        // The 150 is just a safety net! It uses the real AQI from the frontend.
        const { healthProfile = "General Public", language = "English", aqi = 150 } = req.query;

        console.log(`[Groq Agent 3] Generating ${language} advisory for profile: ${healthProfile} at AQI: ${aqi}...`);
        
        const prompt = `You are an AI public health agent for Aero TraceAI. 
        The current Air Quality Index (AQI) in this zone is exactly ${aqi}. 
        Generate a strict, 2-sentence health advisory tailored specifically for a person with this health profile: ${healthProfile}. 
        Write the response in ${language}. 
        Do not include formatting, markdown, or pleasantries. Just the alert and the required action.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant', 
            temperature: 0.7, // Bumped slightly so it doesn't give the exact same string every time
        });

        const advisoryText = completion.choices[0]?.message?.content || "Air quality is poor. Please wear a mask and limit outdoor activities.";

        res.status(200).json({ advisory: advisoryText });

    } catch (error) {
        console.error("❌ [Groq Agent 3] Advisory generation failed:", error);
        res.status(500).json({ error: "Failed to generate advisory." });
    }
};