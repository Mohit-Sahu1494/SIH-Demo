import assetRepository from '../repositories/assetRepository.js';
import { Asset } from '../models/Asset.js';

export const assetController = {
  async getAll(req, res, next) {
    try {
      const stationCode = req.query.stationCode || 'BHT';
      const assets = await assetRepository.findByStationCode(stationCode, req.query);
      res.json({
        success: true,
        data: assets,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const stationCode = req.query.stationCode || 'BHT';

      let asset = null;
      if (id.length === 24) {
        asset = await assetRepository.findById(id);
      }
      if (!asset) {
        asset = await assetRepository.findByAssetId(stationCode, id);
      }

      if (!asset) {
        return res.status(404).json({
          success: false,
          message: `Asset ${id} not found for station ${stationCode}`,
        });
      }

      res.json({
        success: true,
        data: asset,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryBreakdown(req, res, next) {
    try {
      const stationCode = req.params.stationCode || 'BHT';
      const breakdown = await assetRepository.getCategoryHealthBreakdown(stationCode);
      res.json({
        success: true,
        data: breakdown,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const asset = await Asset.create(req.body);
      res.status(201).json({
        success: true,
        data: asset,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await Asset.findByIdAndUpdate(id, { $set: req.body }, { new: true });
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default assetController;
