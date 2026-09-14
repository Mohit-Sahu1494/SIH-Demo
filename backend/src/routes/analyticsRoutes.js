import { Router } from 'express';
import analyticsController from '../controllers/analyticsController.js';

const router = Router();

router.get('/health', analyticsController.getHealth);
router.get('/energy', analyticsController.getEnergy);
router.get('/environment', analyticsController.getEnvironment);
router.get('/alerts', analyticsController.getAlerts);

export default router;
