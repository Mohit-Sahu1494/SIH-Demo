import { Router } from 'express';
import assetController from '../controllers/assetController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { assetSchema } from '../validators/assetValidator.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', assetController.getAll);
router.get('/breakdown/:stationCode', assetController.getCategoryBreakdown);
router.get('/:id', assetController.getById);
router.post('/', authenticate, authorize('ADMIN'), validate(assetSchema), assetController.create);
router.patch('/:id', authenticate, authorize('ADMIN', 'OPERATOR'), assetController.update);

export default router;
