const redis = require('redis');
require('dotenv').config();

// Configuration Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

// Client Redis
let redisClient = null;

async function connectRedis() {
  try {
    if (!redisClient) {
      redisClient = redis.createClient(redisConfig);
      
      redisClient.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis Client Connected');
      });

      await redisClient.connect();
    }
    return redisClient;
  } catch (error) {
    console.error('❌ Error connecting to Redis:', error.message);
    throw error;
  }
}

async function getRedisClient() {
  if (!redisClient) {
    await connectRedis();
  }
  return redisClient;
}

module.exports = {
  connectRedis,
  getRedisClient,
  redisConfig
};
