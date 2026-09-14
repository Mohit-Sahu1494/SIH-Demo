import maintenanceService from '../services/maintenanceService.js';
import { AuditLog } from '../models/AuditLog.js';

export const maintenanceController = {
  async getAll(req, res, next) {
    try {
      const stationCode = req.query.stationCode || 'BHT';
      const status = req.query.status;
      const records = await maintenanceService.getMaintenanceRecords(stationCode, status);
      res.json({
        success: true,
        data: records,
      });
    } catch (err) {
      next(err);
    }
  },

  async getRecommendations(req, res, next) {
    try {
      const stationCode = req.params.stationCode || 'BHT';
      const recommendations = await maintenanceService.getCriticalAssetsWithRecommendations(stationCode);
      res.json({
        success: true,
        data: recommendations,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const record = await maintenanceService.createWorkOrder(req.body);
      await AuditLog.create({
        user: req.user?.email || 'operator',
        action: 'MAINTENANCE_CREATED',
        entity: 'MaintenanceRecord',
        entityId: record._id,
        metadata: { assetId: record.assetId, title: record.title },
      });

      res.status(201).json({
        success: true,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const updated = await maintenanceService.updateStatus(id, status, notes);

      await AuditLog.create({
        user: req.user?.email || 'operator',
        action: 'MAINTENANCE_UPDATED',
        entity: 'MaintenanceRecord',
        entityId: id,
        metadata: { status },
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

export default maintenanceController;
