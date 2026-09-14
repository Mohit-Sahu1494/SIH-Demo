import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import env from './config/env.js';
import errorHandler from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import environmentRoutes from './routes/environmentRoutes.js';
import energyRoutes from './routes/energyRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import dataSourceRoutes from './routes/dataSourceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import mongoose from 'mongoose';
import { getMqttClient } from './mqtt/mqttClient.js';

export function createApp() {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: env.CLIENT_URL || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    })
  );

  // Request logger
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate limiting (generous for SIH development and demo)
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please slow down' },
  });
  app.use('/api', limiter);

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint (Requirement 64)
  app.get('/api/health', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    let isMqttConnected = false;
    try {
      const mqttClient = getMqttClient();
      isMqttConnected = mqttClient?.connected || false;
    } catch (e) {
      isMqttConnected = false;
    }

    res.json({
      success: true,
      status: isDbConnected ? 'healthy' : 'degraded',
      database: isDbConnected ? 'connected' : 'disconnected',
      mqtt: isMqttConnected ? 'connected' : 'active (embedded broker)',
      service: 'POLAR TWIN Mission Control API',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/stations', stationRoutes);
  app.use('/api/assets', assetRoutes);
  app.use('/api/telemetry', telemetryRoutes);
  app.use('/api/environment', environmentRoutes);
  app.use('/api/energy', energyRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/scenarios', scenarioRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/data-sources', dataSourceRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.url} not found on POLAR TWIN API`,
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
