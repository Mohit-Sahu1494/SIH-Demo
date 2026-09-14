import express from 'express';
import weatherService from '../services/weatherService.js';

const router = express.Router();

// GET /api/weather?station=BHT or /api/weather
router.get('/', async (req, res, next) => {
  try {
    const station = req.query.station;
    if (station) {
      const data = await weatherService.getStationWeather(station);
      return res.json({ success: true, data });
    }
    const all = await weatherService.getAllStationsWeather();
    res.json({ success: true, data: all });
  } catch (err) {
    next(err);
  }
});

export default router;
