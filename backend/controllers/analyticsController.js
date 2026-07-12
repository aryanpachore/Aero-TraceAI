// backend/controllers/analyticsController.js
import { Zone, SensorReading, AttributionInsight } from '../models/index.js';
import { generateAttributionInsight } from '../services/aiService.js';

export const getZoneInsights = async (req, res) => {
  try {
    const { zoneId } = req.params;

    // 1. Fetch the Zone metadata
    const zone = await Zone.findByPk(zoneId);
    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }

    // 2. Fetch the most recent Sensor Reading for this zone
    const latestReading = await SensorReading.findOne({
      where: { zoneId: zone.id },
      order: [['timestamp', 'DESC']],
    });

    if (!latestReading) {
      return res.status(404).json({ error: "No sensor data available for this zone yet. Wait for the cron job to run." });
    }

    // 3. Trigger the Groq AI Agent
    const aiResult = await generateAttributionInsight(zone, latestReading);

    // 4. Save the AI's insight into the MySQL database
    const savedInsight = await AttributionInsight.create({
      zoneId: zone.id,
      sourceBreakdown: aiResult.sourceBreakdown,
      confidenceScore: aiResult.confidenceScore,
      recommendedAction: aiResult.recommendedAction,
    });

    // 5. Send the saved data back to the frontend to render the charts
    res.status(200).json(savedInsight);

  } catch (error) {
    console.error('Error generating insight:', error);
    res.status(500).json({ error: "Failed to generate AI insights" });
  }
};