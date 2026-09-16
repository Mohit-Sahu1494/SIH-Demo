import { Router } from 'express';
import { simulator } from '../simulator/simulator.js';
import { getSocketServer } from '../sockets/socket.js';

const router = Router();

router.get('/current', (req, res) => {
  res.json({
    success: true,
    data: {
      ...simulator.getCurrentScenario(),
      stressOverrides: simulator.stressOverrides || {},
    },
  });
});

router.post('/trigger', (req, res) => {
  const { scenarioName } = req.body;
  const result = simulator.setScenario(scenarioName);

  const io = getSocketServer();
  if (io) {
    io.emit('scenario-changed', result);
  }

  res.json({
    success: true,
    data: result,
  });
});

router.post('/stress', (req, res) => {
  const params = req.body;
  const result = simulator.setStressOverrides(params);

  const io = getSocketServer();
  if (io) {
    io.emit('scenario-stress-update', {
      params,
      scenario: simulator.getCurrentScenario(),
      timestamp: new Date(),
    });
  }

  res.json({
    success: true,
    data: {
      params,
      scenario: result,
    },
  });
});

router.post('/reset', (req, res) => {
  simulator.resetStressOverrides();
  const result = simulator.setScenario('NORMAL');

  const io = getSocketServer();
  if (io) {
    io.emit('scenario-changed', result);
    io.emit('scenario-stress-update', {
      params: {},
      scenario: result,
      timestamp: new Date(),
    });
  }

  res.json({
    success: true,
    data: result,
  });
});

export default router;
