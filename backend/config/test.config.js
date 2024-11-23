module.exports = {
    redis: {
      host: 'redis-cache',
      port: 6379,
      mock: true
    },
    postgres: {
      host: 'postgres',
      port: 5432,
      mock: true
    },
    mongodb: {
      uri: process.env.MONGODB_URI,
      mock: true
    }
  };