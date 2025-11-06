const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis Client Ready');
    });

    await redisClient.connect();

  } catch (error) {
    console.error('❌ Error connecting to Redis:', error.message);
    console.warn('⚠️  Application will run without Redis cache');
  }
};

const getRedisClient = () => {
  return redisClient;
};

module.exports = connectRedis;
module.exports.getRedisClient = getRedisClient;

