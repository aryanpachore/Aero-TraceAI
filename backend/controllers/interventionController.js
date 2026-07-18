// backend/controllers/interventionController.js
import { InterventionLog } from '../models/index.js';

export const logIntervention = async (req, res) => {
  try {
    const { zoneId, actionTaken, notes } = req.body;
    const log = await InterventionLog.create({ zoneId, actionTaken, notes });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: "Failed to securely write to compliance log." });
  }
};

export const getInterventionsByZone = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const logs = await InterventionLog.findAll({
      where: { zoneId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to compile compliance history logs." });
  }
};