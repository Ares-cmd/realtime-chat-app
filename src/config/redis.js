const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = process.env.REDIS_PORT || 6379;
    const redisUrl = `redis://${redisHost}:${redisPort}`;
    
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        family: 4, // Force IPv4
      },
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

