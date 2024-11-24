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
      
      // Security settings
      tls: process.env.REDIS_TLS === 'true',
      
      // Connection retry strategy
      retryStrategy: (times) => {
        // Exponential backoff with max delay of 2 seconds
        return Math.min(times * 50, 2000);
      },
      
      // Connection reliability settings
      maxRetriesPerRequest: 5,
      enableReadyCheck: true,
      retryOnAuthFailure: true,
      
      // Connection timeouts
      connectTimeout: 10000, // 10 seconds
      keepAlive: 10000,
      
      // Error handling configuration
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
      
      // Reconnect if we get a READONLY error
      reconnectOnError: (err) => {
        return err.message.includes('READONLY');
      }
    });


//Get data from cache or set it if it doesn't exist
const getOrSetCache = async (key, cb) => {
  try {
    // Try to get data from cache
    const data = await redis.get(key);
    if (data != null) {
      return JSON.parse(data);
    }
    
    // If no cached data, fetch fresh data
    const freshData = await cb();
    if (!freshData) {
      return null; // Handle non-existent data gracefully
    }
    
    // Store fresh data in cache
    await redis.setex(
      key,
      DEFAULT_EXPIRATION,
      JSON.stringify(freshData)
    );
    
    return freshData;
  } catch (error) {
    // Silently fall back to callback on Redis errors
    return await cb();
  }
};


//@returns {Promise<boolean>} Resolved with connection status
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