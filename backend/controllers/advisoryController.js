// backend/controllers/advisoryController.js
import { Zone, SensorReading, Advisory } from '../models/index.js';
import { generateHealthAdvisories } from '../services/geminiService.js';

export const getZoneAdvisories = async (req, res) => {
  try {
    const { zoneId } = req.params;

    const zone = await Zone.findByPk(zoneId);
    const latestReading = await SensorReading.findOne({
      where: { zoneId: zone.id },
      order: [['timestamp', 'DESC']],
    });

    if (!zone || !latestReading) {
      return res.status(404).json({ error: "Zone or sensor data not found." });
    }

    // Trigger the Gemini Agent
    const aiResult = await generateHealthAdvisories(zone, latestReading);

    // Bulk create the translations in the MySQL table
    const savedAdvisories = await Promise.all(
      aiResult.advisories.map(adv => 
        Advisory.create({
          zoneId: zone.id,
          targetProfile: aiResult.targetProfile,
          language: adv.language,
          message: adv.message,
        })
      )
    );

    res.status(200).json({
      message: "Advisories generated successfully",
      data: savedAdvisories
    });

  } catch (error) {
    console.error('Error generating advisories:', error);
    res.status(500).json({ error: "Failed to generate health advisories" });
  }
};