import Redis from 'ioredis';
import RedisMock from 'ioredis-mock'; // Import the mock Redis client
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// File and directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv to load .env file from the correct location
dotenv.config({ path: resolve(__dirname, '/.env') });

// Initialize a new Redis instance with custom configuration
const redis = process.env.NODE_ENV === 'test'
  ? new RedisMock() // Use mock Redis for tests
  : new Redis({
      host: process.env.REDIS_HOST || 'redis-cache', // Specify the host where Redis is running
      port: process.env.REDIS_PORT || 6379, // Default Redis port
      password: process.env.REDIS_PASSWORD, // Load Redis password from .env file
      username: process.env.REDIS_USERNAME || 'default', // Added Redis username with default fallback
      tls: process.env.REDIS_TLS === 'true', // Added TLS support if enabled in env
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000); // Set a delay strategy for reconnection attempts
        return delay;
      },
      maxRetriesPerRequest: 5, // Limit the number of retries per request
      enableReadyCheck: true, // Enable ready check for better connection validation
      reconnectOnError: (err) => {
        if (err.message.includes('READONLY')) {
          return true;
        }
        return false;
      },
      retryOnAuthFailure: true, // Retry mechanism for authentication failures
      connectTimeout: 10000, // Connection timeout
      keepAlive: 10000, // Keep-alive configuration
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production' // Debug mode for better error tracking
    });

const DEFAULT_EXPIRATION = 1800; // Cache expiration time in seconds (30 minutes)

// Function to get data from cache or set it if it doesn't exist
const getOrSetCache = async (key, cb) => {
  try {
    const data = await redis.get(key); // Try retrieving data from Redis by key
    if (data != null) {
      return JSON.parse(data); // Return cached data if it exists
    }
    
    const freshData = await cb(); // Execute callback to fetch fresh data if no cached data
    await redis.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData)); // Store fresh data in cache
    return freshData;
  } catch (error) {
    // Handle Redis errors and fallback to fresh data
    console.error('Redis error:', error);
    return await cb();
  }
};

// Error handling for Redis connection errors
redis.on('error', (error) => {
  console.error('Redis Error:', error);
  // Added specific error handling for authentication failures
  if (error.message.includes('WRONGPASS')) {
    console.error('Authentication failed - please verify Redis credentials');
  }
});

// Log successful connection to Redis
redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

// Added connection ready event handler
redis.on('ready', () => {
  console.log('Redis client ready and authenticated');
});

// Added health check function
// Function to verify Redis connection and authentication
const healthCheck = async () => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};

export { redis, getOrSetCache, healthCheck };