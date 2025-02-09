import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Convert ESM module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '/.env') });

// Default cache expiration time in seconds (30 minutes)
const DEFAULT_EXPIRATION = 1800;

/**
 * Initialize Redis client based on environment
 * Uses RedisMock for testing and real Redis client for other environments
 */
const redis = process.env.NODE_ENV === 'test'
  ? new RedisMock()
  : new Redis({
      // Basic connection settings
      host: process.env.REDIS_HOST || 'redis-cache',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME || 'default',

      // Faster failure detection if Redis is unavailable
      connectTimeout: 1000, // 1s
      maxRetriesPerRequest: 2, // 2 retry
      enableReadyCheck: false, // Disables long readiness checks
      retryStrategy: (times) => {
        console.warn(`Redis reconnect attempt ${times}`);
        return times > 3 ? null : 100; // Stop retrying after 2 attempts
      },

      // Avoid reconnection if Redis is unreachable
      reconnectOnError: (err) => {
        console.error("Redis error detected:", err.message);
        return false; // Do not attempt reconnect
      },
    });

/**
 * Get data from cache or set it if it doesn't exist
 * Falls back to database if Redis is unavailable
 */
const getOrSetCache = async (key, cb) => {
  let redisAvailable = process.env.DISABLE_REDIS !== "true";

  // Quick check if Redis is available
  try {
    await redis.ping();
  } catch (err) {
    console.warn("Redis not available, using database fallback");
    redisAvailable = false;
  }

  if (redisAvailable) {
    try {
      // Attempt to get data from cache
      const data = await redis.get(key);
      if (data != null) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn("Redis error, falling back to database");
    }
  }

  // If Redis is unavailable, fetch data directly from the database
  const freshData = await cb();
  if (redisAvailable) {
    try {
      await redis.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
    } catch (error) {
      console.warn("Failed to cache data");
    }
  }
  return freshData;
};

/**
 * @returns {Promise<boolean>} Resolved with connection status
 */
const healthCheck = async () => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
};

// Event Handlers

/**
 * Handle Redis errors
 */
redis.on('error', (error) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Redis Error:', error);

    // Special handling for authentication failures
    if (error.message.includes('WRONGPASS')) {
      console.error('Authentication failed - please verify Redis credentials');
    }
  }
});

/**
 * Log successful connection
 */
redis.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Successfully connected to Redis');
  }
});

/**
 * Log when client is ready and authenticated
 */
redis.on('ready', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Redis client ready and authenticated');
  }
});

export { redis, getOrSetCache, healthCheck };