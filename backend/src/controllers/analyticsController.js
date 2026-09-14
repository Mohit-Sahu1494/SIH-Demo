import analyticsService from '../services/analyticsService.js';

export const analyticsController = {
  async getHealth(req, res, next) {
    try {
      const stationCode = req.query.stationCode || 'BHT';
      const days = parseInt(req.query.days || '7', 10);
      const data = await analyticsService.getHealthHistory(stationCode, days);
      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async getEnergy(req, res, next) {
    try {
      const stationCode = req.query.stationCode || 'BHT';
      const hours = parseInt(req.query.hours || '24', 10);
      const data = await analyticsService.getEnergyHistory(stationCode, hours);
      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async getEnvironment(req, res, next) {
    try {
      const stationCode = req.query.stationCode || 'BHT';
      const hours = parseInt(req.query.hours || '24', 10);
      const data = await analyticsService.getEnvironmentHistory(stationCode, hours);
      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async getAlerts(req, res, next) {
    try {
      const stationCode = req.query.stationCode || 'BHT';
      const data = await analyticsService.getAlertStats(stationCode);
      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default analyticsController;
