import inventoryRepository from '../repositories/inventoryRepository.js';
import { InventoryItem } from '../models/InventoryItem.js';

export const inventoryController = {
  async getAll(req, res, next) {
    try {
      const stationCode = req.query.stationCode || 'BHT';
      const items = await inventoryRepository.findByStationCode(stationCode, req.query);
      res.json({
        success: true,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  },

  async getSummary(req, res, next) {
    try {
      const stationCode = req.params.stationCode || 'BHT';
      const summary = await inventoryRepository.getSummary(stationCode);
      res.json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const item = await InventoryItem.create(req.body);
      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, daysRemaining, status } = req.body;
      const updated = await inventoryRepository.updateQuantity(id, quantity, daysRemaining, status);
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default inventoryController;
