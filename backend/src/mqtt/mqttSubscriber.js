import { getMqttClient } from './mqttClient.js';
import topicHandlers from './topicHandlers.js';

export function initMqttSubscriber() {
  const client = getMqttClient();

  const topics = [
    'stations/+/environment',
    'stations/+/energy',
    'stations/+/assets/+/telemetry',
  ];

  client.on('connect', () => {
    for (const t of topics) {
      client.subscribe(t, (err) => {
        if (err) {
          console.error(`[MQTT Subscriber] Failed to subscribe to ${t}:`, err);
        } else {
          console.log(`[MQTT Subscriber] Subscribed to topic: ${t}`);
        }
      });
    }
  });

  client.on('message', async (topic, message) => {
    const parts = topic.split('/');
    // Format 1: stations/{code}/environment
    // Format 2: stations/{code}/energy
    // Format 3: stations/{code}/assets/{assetId}/telemetry

    if (parts[0] !== 'stations') return;
    const rawStation = parts[1].toLowerCase();
    const stationCode = rawStation === 'maitri' || rawStation === 'mtr' ? 'MTR' : 'BHT';

    try {
      const payloadStr = message.toString();

      if (parts[2] === 'environment') {
        await topicHandlers.handleEnvironment(stationCode, payloadStr);
      } else if (parts[2] === 'energy') {
        await topicHandlers.handleEnergy(stationCode, payloadStr);
      } else if (parts[2] === 'assets' && parts[4] === 'telemetry') {
        const assetId = parts[3];
        await topicHandlers.handleAssetTelemetry(stationCode, assetId, payloadStr);
      }
    } catch (err) {
      console.error(`[MQTT Subscriber] Message processing error on topic ${topic}:`, err.message);
    }
  });

  return client;
}

export default initMqttSubscriber;
