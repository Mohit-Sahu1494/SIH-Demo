import { Server } from 'socket.io';
import alertService from '../services/alertService.js';
import telemetryService from '../services/telemetryService.js';
import maintenanceService from '../services/maintenanceService.js';

let ioInstance = null;

export function initSocketServer(httpServer, clientUrl) {
  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance = io;

  // Bind references to services
  alertService.setSocketServer(io);
  telemetryService.setSocketServer(io);
  maintenanceService.setSocketServer(io);

  io.on('connection', (socket) => {
    console.log(`\x1b[36m[Socket.IO] Client connected: ${socket.id}\x1b[0m`);

    socket.on('join-station', (stationCode) => {
      const room = stationCode.toUpperCase();
      socket.join(room);
      console.log(`[Socket.IO] Client ${socket.id} joined station room: ${room}`);
    });

    socket.on('leave-station', (stationCode) => {
      const room = stationCode.toUpperCase();
      socket.leave(room);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getSocketServer() {
  return ioInstance;
}

export default {
  initSocketServer,
  getSocketServer,
};
