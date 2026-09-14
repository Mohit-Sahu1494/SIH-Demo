import { Router } from 'express';
import energyController from '../controllers/energyController.js';

const router = Router();

router.get('/', energyController.getLatest);
router.get('/latest', energyController.getLatest);
router.get('/history', energyController.getHistory);
router.get('/:stationId', energyController.getLatest);
router.post('/', energyController.ingest);

export default router;
