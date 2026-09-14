import authService from '../services/authService.js';
import { AuditLog } from '../models/AuditLog.js';

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      await AuditLog.create({
        user: result.user.email,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: result.user.id,
      });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      await AuditLog.create({
        user: result.user.email,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: result.user.id,
      });
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res) {
    res.json({
      success: true,
      data: req.user,
    });
  },
};

export default authController;
