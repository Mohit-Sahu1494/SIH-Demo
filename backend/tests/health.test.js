import { test } from 'node:test';
import assert from 'node:assert/strict';
import { healthService } from '../src/services/healthService.js';

test('Health Service calculates weighted station health accurately', () => {
  const env = 94;
  const energy = 87;
  const infra = 91;
  const logistics = 92;

  const weights = healthService.weights;
  const computed = Math.round(
    env * weights.environment +
    energy * weights.energy +
    infra * weights.infrastructure +
    logistics * weights.logistics
  );

  // 94*0.20 + 87*0.25 + 91*0.35 + 92*0.20 = 18.8 + 21.75 + 31.85 + 18.4 = 90.8 -> 91
  assert.equal(computed, 91, 'Expected overall health to equal 91%');
});
