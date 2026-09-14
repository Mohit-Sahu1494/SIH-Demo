import { Router } from 'express';
import environmentController from '../controllers/environmentController.js';

const router = Router();

router.get('/', environmentController.getLatest);
router.get('/latest', environmentController.getLatest);
router.get('/history', environmentController.getHistory);
router.get('/:stationId', environmentController.getLatest);
router.post('/', environmentController.ingest);

export default router;
