import mqtt from 'mqtt';
import env from '../config/env.js';

let client = null;

export function connectMqtt() {
  if (client) return client;

  console.log(`[MQTT] Connecting to broker at ${env.MQTT_BROKER_URL}...`);
  const options = {
    reconnectPeriod: 2000,
    connectTimeout: 5000,
  };

  if (env.MQTT_USERNAME) options.username = env.MQTT_USERNAME;
  if (env.MQTT_PASSWORD) options.password = env.MQTT_PASSWORD;

  client = mqtt.connect(env.MQTT_BROKER_URL, options);

  client.on('connect', () => {
    console.log(`\x1b[32m[MQTT] Connected successfully to MQTT broker at ${env.MQTT_BROKER_URL}\x1b[0m`);
  });

  client.on('error', (err) => {
    console.warn(`[MQTT] Connection error: ${err.message}`);
  });

  client.on('offline', () => {
    console.log('[MQTT] Client is offline.');
  });

  return client;
}

export function getMqttClient() {
  return client || connectMqtt();
}

export default {
  connectMqtt,
  getMqttClient,
};
