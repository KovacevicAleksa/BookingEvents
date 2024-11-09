import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis-cache',  // Mora da se poklapa sa container_name iz docker-compose
  port: 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 5,
  enableReadyCheck: false,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

const DEFAULT_EXPIRATION = 1800;

const getOrSetCache = async (key, cb) => {
  try {
    const data = await redis.get(key);
    if (data != null) {
      return JSON.parse(data);
    }
    
    const freshData = await cb();
    await redis.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    console.error('Redis error:', error);
    return await cb();
  }
};

// Dodaj error handling
redis.on('error', (error) => {
  console.error('Redis Error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export { redis, getOrSetCache };