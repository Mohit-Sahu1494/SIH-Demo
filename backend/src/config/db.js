import mongoose from 'mongoose';
import env from './env.js';

let memoryServerInstance = null;

export async function connectDB() {
  try {
    console.log(`[DB] Connecting to MongoDB at: ${env.MONGODB_URI}...`);
    
    // Set connection timeout to quickly fallback if external DB is not running
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    
    console.log(`\x1b[32m[DB] Successfully connected to MongoDB at ${env.MONGODB_URI}\x1b[0m`);
    return mongoose.connection;
  } catch (primaryErr) {
    console.warn(`[DB] Could not connect to primary MongoDB (${primaryErr.message}).`);
    
    if (env.USE_MEMORY_DB_FALLBACK) {
      console.log('\x1b[33m[DB] Initializing embedded in-memory MongoDB server for seamless demo...\x1b[0m');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        
        await mongoose.connect(memUri);
        console.log(`\x1b[32m[DB] Connected to embedded in-memory MongoDB at ${memUri}\x1b[0m`);
        return mongoose.connection;
      } catch (memErr) {
        console.error('[DB] Failed to initialize embedded MongoDB fallback:', memErr);
        throw primaryErr;
      }
    } else {
      throw primaryErr;
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
}

export default connectDB;
