import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI is not defined in environment variables. Database connection skipped.');
    return null;
  }

  try {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log(`[db] MongoDB connected successfully to database: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[db] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[db] MongoDB disconnected.');
    });

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    return conn;
  } catch (error) {
    console.error('[db] Failed to connect to MongoDB:', error.message);
    // Do not throw fatal error so server and webhook verification can stay alive
    return null;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[db] MongoDB disconnected gracefully.');
  }
}

export default mongoose;
