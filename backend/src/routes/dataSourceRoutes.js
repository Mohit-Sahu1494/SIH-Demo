import express from 'express';
import { DataSource } from '../models/DataSource.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/data-sources
router.get('/', async (req, res, next) => {
  try {
    const sources = await DataSource.find({}).sort({ code: 1 }).lean();
    res.json({
      success: true,
      data: sources,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/data-sources/:id/status
router.get('/:id/status', async (req, res, next) => {
  try {
    const source = await DataSource.findById(req.params.id).lean();
    if (!source) {
      return res.status(404).json({ success: false, message: 'Data source not found' });
    }
    res.json({
      success: true,
      data: {
        id: source._id,
        name: source.name,
        code: source.code,
        type: source.type,
        status: source.status,
        lastSync: source.lastSync,
        reliabilityScore: source.reliabilityScore,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
