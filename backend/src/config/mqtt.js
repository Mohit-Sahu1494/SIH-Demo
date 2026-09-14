import net from 'net';
import env from './env.js';

let aedesBrokerInstance = null;
let aedesServerInstance = null;

export async function initMqttBroker() {
  if (!env.MQTT_EMBEDDED_BROKER) {
    return null;
  }

  return new Promise(async (resolve) => {
    try {
      const { default: Aedes } = await import('aedes');
      const aedes = new Aedes();
      const server = net.createServer(aedes.handle);

      server.listen(1883, () => {
        console.log('\x1b[32m[MQTT Broker] Embedded Aedes MQTT broker running on port 1883\x1b[0m');
        aedesBrokerInstance = aedes;
        aedesServerInstance = server;
        resolve({ aedes, server });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log('[MQTT Broker] Port 1883 already in use. Assuming external MQTT broker is active.');
        } else {
          console.warn('[MQTT Broker] Embedded broker error:', err.message);
        }
        resolve(null);
      });
    } catch (err) {
      console.warn('[MQTT Broker] Could not load embedded Aedes broker:', err.message);
      resolve(null);
    }
  });
}

export function closeMqttBroker() {
  if (aedesServerInstance) {
    aedesServerInstance.close();
  }
}

export default {
  initMqttBroker,
  closeMqttBroker,
};
