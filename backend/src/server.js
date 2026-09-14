import http from 'http';
import env from './config/env.js';
import connectDB from './config/db.js';
import { initMqttBroker } from './config/mqtt.js';
import createApp from './app.js';
import { initSocketServer } from './sockets/socket.js';
import { initMqttSubscriber } from './mqtt/mqttSubscriber.js';
import { simulator } from './simulator/simulator.js';
import { Station } from './models/Station.js';
import { seedDatabase } from './seed/seedDatabase.js';

async function bootstrap() {
  console.log('\x1b[36m%s\x1b[0m', '=====================================================');
  console.log('\x1b[36m%s\x1b[0m', '      POLAR TWIN — Antarctic Digital Twin Platform   ');
  console.log('\x1b[36m%s\x1b[0m', '=====================================================\n');

  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Check if DB needs auto-seeding (if stations collection is empty)
    const stationCount = await Station.countDocuments();
    if (stationCount === 0) {
      console.log('[Bootstrap] Database is empty. Running initial auto-seed for Maitri and Bharati...');
      await seedDatabase();
      // Reconnect if seed closed connection
      await connectDB();
    }

    // 3. Start MQTT Broker (embedded Aedes fallback or detects active broker)
    await initMqttBroker();

    // 4. Create Express app and HTTP server
    const app = createApp();
    const server = http.createServer(app);

    // 5. Initialize Socket.IO
    initSocketServer(server, env.CLIENT_URL);

    // 6. Initialize MQTT Subscriber (Telemetry Ingestion Service)
    initMqttSubscriber();

    // 7. Start Telemetry Simulator
    simulator.start();

    // 8. Start HTTP Server
    server.listen(env.PORT, () => {
      console.log('\x1b[32m%s\x1b[0m', `\n>>> POLAR TWIN API Server listening on port ${env.PORT}`);
      console.log(`>>> Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`>>> Client URL:   ${env.CLIENT_URL}`);
      console.log(`>>> Real-time WebSockets: ENABLED`);
      console.log(`>>> MQTT Telemetry Ingestion: ACTIVE\n`);
    });

    const shutdown = async () => {
      console.log('\n[Shutdown] Terminating POLAR TWIN backend processes gracefully...');
      simulator.stop();
      server.close(() => {
        console.log('[Shutdown] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('\x1b[31m[Bootstrap Fatal Error]\x1b[0m', err);
    process.exit(1);
  }
}

bootstrap();
