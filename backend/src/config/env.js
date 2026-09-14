import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to process.env

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/polar_twin',
  USE_MEMORY_DB_FALLBACK: process.env.USE_MEMORY_DB_FALLBACK !== 'false',
  JWT_SECRET: process.env.JWT_SECRET || 'polar_twin_super_secret_jwt_key_sih_2024_antarctica',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  MQTT_EMBEDDED_BROKER: process.env.MQTT_EMBEDDED_BROKER !== 'false',
  MQTT_USERNAME: process.env.MQTT_USERNAME || '',
  MQTT_PASSWORD: process.env.MQTT_PASSWORD || '',
};

export default env;
