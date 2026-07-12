// backend/controllers/locationController.js
import { Zone, SensorReading, Advisory } from '../models/index.js';

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

export const getLocalDashboardData = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude are required." });
    }

    // 1. Find all zones and calculate distance
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
      return res.status(404).json({ error: "No data available for your current location." });
    }

    // 2. Fetch the latest AQI data for the matched zone
    const latestReading = await SensorReading.findOne({
      where: { zoneId: closestZone.id },
      order: [['timestamp', 'DESC']],
    });

    // 3. Fetch the latest Advisories for this zone
    const advisories = await Advisory.findAll({
      where: { zoneId: closestZone.id },
      order: [['createdAt', 'DESC']],
      limit: 3 
    });

    // 4. Send the combined dashboard payload to the frontend
    res.status(200).json({
      zone: closestZone,
      airQuality: latestReading,
      advisories: advisories
    });

  } catch (error) {
    console.error('[Location Error]', error);
    res.status(500).json({ error: "Failed to fetch local dashboard data." });
  }
};