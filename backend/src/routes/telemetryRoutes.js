import { Router } from 'express';
import telemetryController from '../controllers/telemetryController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { telemetryPayloadSchema } from '../validators/telemetryValidator.js';

const router = Router();

router.get('/:assetId', telemetryController.getByAsset);
router.get('/param/:parameter', telemetryController.getByParameter);
router.post('/', validate(telemetryPayloadSchema), telemetryController.ingest);

export default router;
