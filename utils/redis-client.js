const { Redis } = require('@upstash/redis');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('Upstash Redis (REST) ready! 🚀');

module.exports = redisClient;