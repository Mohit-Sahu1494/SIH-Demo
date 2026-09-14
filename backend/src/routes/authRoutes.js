import { Router } from 'express';
import authController from '../controllers/authController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { loginSchema, registerSchema } from '../validators/authValidator.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
