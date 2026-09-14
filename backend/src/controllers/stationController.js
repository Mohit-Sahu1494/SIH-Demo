import stationRepository from '../repositories/stationRepository.js';
import healthService from '../services/healthService.js';
import aiInsightsService from '../services/aiInsightsService.js';

export const stationController = {
  async getAll(req, res, next) {
    try {
      const stations = await stationRepository.findAll();
      res.json({
        success: true,
        data: stations,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      let station = null;
      if (id.length === 24) {
        station = await stationRepository.findById(id);
      }
      if (!station) {
        station = await stationRepository.findByCode(id);
      }

      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Station not found',
        });
      }

      res.json({
        success: true,
        data: station,
      });
    } catch (err) {
      next(err);
    }
  },

  async getHealth(req, res, next) {
    try {
      const { code } = req.params;
      const health = await healthService.computeStationHealth(code);
      if (!health) {
        return res.status(404).json({
          success: false,
          message: 'Station not found',
        });
      }
      res.json({
        success: true,
        data: health,
      });
    } catch (err) {
      next(err);
    }
  },

  async getInsights(req, res, next) {
    try {
      const { code } = req.params;
      const insights = await aiInsightsService.generateInsights(code);
      res.json({
        success: true,
        data: insights,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default stationController;
