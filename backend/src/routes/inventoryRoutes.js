import { Router } from 'express';
import inventoryController from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', inventoryController.getAll);
router.get('/summary/:stationCode', inventoryController.getSummary);
router.post('/', authenticate, authorize('ADMIN', 'OPERATOR'), inventoryController.create);
router.patch('/:id', authenticate, authorize('ADMIN', 'OPERATOR'), inventoryController.update);

export default router;
