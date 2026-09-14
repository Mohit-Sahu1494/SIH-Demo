import { Router } from 'express';
import alertController from '../controllers/alertController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', alertController.getAll);
router.get('/count/active', alertController.getActiveCount);
router.post('/', alertController.create);
router.patch('/:id/acknowledge', authenticate, alertController.acknowledge);
router.patch('/:id/resolve', authenticate, alertController.resolve);

export default router;
