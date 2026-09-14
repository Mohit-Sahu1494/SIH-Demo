import alertRepository from '../repositories/alertRepository.js';
import alertService from '../services/alertService.js';
import { AuditLog } from '../models/AuditLog.js';

export const alertController = {
  async getAll(req, res, next) {
    try {
      const alerts = await alertRepository.getAlerts(req.query);
      res.json({
        success: true,
        data: alerts,
      });
    } catch (err) {
      next(err);
    }
  },

  async getActiveCount(req, res, next) {
    try {
      const stationCode = req.query.stationCode;
      const count = await alertRepository.countActive(stationCode);
      res.json({
        success: true,
        data: { count },
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const alert = await alertService.handleCondition(req.body);
      res.status(201).json({
        success: true,
        data: alert,
      });
    } catch (err) {
      next(err);
    }
  },

  async acknowledge(req, res, next) {
    try {
      const { id } = req.params;
      const operatorName = req.user?.name || req.body?.operatorName || 'Officer On Duty';
      const updated = await alertService.acknowledgeAlert(id, operatorName);

      await AuditLog.create({
        user: req.user?.email || 'operator',
        action: 'ALERT_ACKNOWLEDGED',
        entity: 'Alert',
        entityId: id,
        metadata: { operatorName },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async resolve(req, res, next) {
    try {
      const { id } = req.params;
      const operatorName = req.user?.name || req.body?.operatorName || 'Officer On Duty';
      const updated = await alertService.resolveAlert(id, operatorName);

      await AuditLog.create({
        user: req.user?.email || 'operator',
        action: 'ALERT_RESOLVED',
        entity: 'Alert',
        entityId: id,
        metadata: { operatorName },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default alertController;
