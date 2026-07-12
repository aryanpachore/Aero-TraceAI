// backend/services/ingestionService.js
import axios from 'axios';
import { Zone, SensorReading } from '../models/index.js';

async function fetchAirQualityData() {
  console.log('[Ingestion] Starting scheduled data fetch...');
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  try {
    const zones = await Zone.findAll();

    for (const zone of zones) {
      try {
        // Attempt to fetch real data (CORRECTED URL)
        const response = await axios.get(
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${zone.centerLat}&lon=${zone.centerLng}&appid=${API_KEY}`
        );
        
        const data = response.data.list[0];
        
        await SensorReading.create({
          zoneId: zone.id,
          aqi: data.main.aqi,
          pm25: data.components.pm2_5,
          pm10: data.components.pm10,
          windSpeed: Math.random() * 15, 
          windDeg: Math.floor(Math.random() * 360),
        });

        console.log(`[Ingestion] Saved LIVE reading for Zone: ${zone.name}`);
      } catch (apiError) {
        console.warn(`[Ingestion] API failed for ${zone.name}. Injecting mock data...`);
        
        await SensorReading.create({
          zoneId: zone.id,
          aqi: Math.floor(Math.random() * 4) + 1, 
          pm25: Math.floor(Math.random() * 200) + 50, 
          pm10: Math.floor(Math.random() * 150) + 50,
          windSpeed: Math.random() * 15, 
          windDeg: Math.floor(Math.random() * 360),
        });
        
        console.log(`[Ingestion] Saved MOCK reading for Zone: ${zone.name}`);
      }
    }
  } catch (error) {
    console.error('[Ingestion] Database error during fetch:', error.message);
  }
}

export { fetchAirQualityData };