import { Router } from 'express';
import stationController from '../controllers/stationController.js';

const router = Router();

router.get('/', stationController.getAll);
router.get('/:id', stationController.getById);
router.get('/:code/health', stationController.getHealth);
router.get('/:code/insights', stationController.getInsights);

export default router;
