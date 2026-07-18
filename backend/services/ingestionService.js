// backend/services/ingestionService.js
import { Zone, SensorReading } from '../models/index.js';

export const fetchAirQualityData = async () => {
  try {
    console.log('[Ingestion Pipeline] Initializing synchronized air quality and weather fetch...');
    
    const zones = await Zone.findAll();
    
    if (zones.length === 0) {
      console.log('[Ingestion Pipeline] No registered zones found. Skipping cycle.');
      return;
    }

    for (const zone of zones) {
      const baseAQI = zone.type === 'Industrial' ? 160 : 75;
      const fluctuation = Math.floor(Math.random() * 40) - 10;
      
      const pm25 = baseAQI + fluctuation;
      const pm10 = Math.floor(pm25 * 1.4);
      const aqi = pm25; // Simulating AQI based heavily on PM2.5 for the mock
      
      const no2 = zone.type === 'Industrial' ? 45 + Math.random() * 20 : 20 + Math.random() * 10;
      const so2 = zone.type === 'Industrial' ? 35 + Math.random() * 15 : 8 + Math.random() * 5;

      const windSpeed = parseFloat((Math.random() * 25).toFixed(2));
      const windDeg = Math.floor(Math.random() * 360); // Degrees instead of 'NE', 'SW'
      const temperature = parseFloat((22 + Math.random() * 12).toFixed(1));
      const humidity = Math.floor(40 + Math.random() * 30);

      await SensorReading.create({
        zoneId: zone.id,
        aqi,          // FIXED: Added required AQI field
        pm25,
        pm10,
        no2,
        so2,
        windSpeed,
        windDeg,      // FIXED: Matches your DB schema
        temperature,
        humidity,
        timestamp: new Date() // FIXED: Matches your DB schema
      });

      console.log(`[Ingestion Pipeline] Mapped parameters successfully for Zone: ${zone.name}`);
    }
    
    console.log('✅ [Ingestion Pipeline] Hourly execution cycle completed.');
  } catch (error) {
    console.error('❌ [Ingestion Pipeline] Processing error encountered:', error);
  }
};