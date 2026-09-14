import { Router } from 'express';
import { simulator } from '../simulator/simulator.js';

const router = Router();

router.get('/current', (req, res) => {
  res.json({
    success: true,
    data: simulator.getCurrentScenario(),
  });
});

router.post('/trigger', (req, res) => {
  const { scenarioName } = req.body;
  const result = simulator.setScenario(scenarioName);
  res.json({
    success: true,
    data: result,
  });
});

router.post('/reset', (req, res) => {
  const result = simulator.setScenario('NORMAL');
  res.json({
    success: true,
    data: result,
  });
});

export default router;
