import { Router } from 'express';
import maintenanceController from '../controllers/maintenanceController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', maintenanceController.getAll);
router.get('/recommendations/:stationCode', maintenanceController.getRecommendations);
router.post('/', authenticate, maintenanceController.create);
router.patch('/:id', authenticate, maintenanceController.update);

export default router;
