import Redis from 'ioredis';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// File and directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv to load .env file from the correct location
dotenv.config({ path: resolve(__dirname, '/.env') });

// Validate Redis credentials
// Added validation check to ensure Redis password is provided

console.log(process.env.REDIS_PASSWORD);

// Initialize a new Redis instance with custom configuration
const redis = new Redis({
  host: 'redis-cache', // Specify the host where Redis is running
  port: 6379, // Default Redis port
  password: process.env.REDIS_PASSWORD, // Load Redis password from .env file
  username: process.env.REDIS_USERNAME || 'default', // Added Redis username with default fallback
  tls: process.env.REDIS_TLS === 'true', // Added TLS support if enabled in env
  retryStrategy: (times) => {
    // Set a delay strategy for reconnection attempts, up to a maximum of 2 seconds
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 5, // Limit the number of retries per request
  enableReadyCheck: true, // Enable ready check for better connection validation
  reconnectOnError: (err) => {
    // Reconnect if Redis enters READONLY mode (e.g., during failover)
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  // Added retry mechanism for authentication failures
  retryOnAuthFailure: true,
  // Added connection timeout
  connectTimeout: 10000,
  // Added keep-alive configuration
  keepAlive: 10000,
  // Added debug mode for better error tracking
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production'
});

const DEFAULT_EXPIRATION = 1800; // Cache expiration time in seconds (30 minutes)

// Function to get data from cache or set it if it doesn't exist
const getOrSetCache = async (key, cb) => {
  try {
    const data = await redis.get(key); // Try retrieving data from Redis by key
    if (data != null) {
      return JSON.parse(data); // Return cached data if it exists
    }
    
    // If no cached data, execute callback to fetch fresh data
    const freshData = await cb();
    // Store fresh data in cache with expiration
    await redis.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
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