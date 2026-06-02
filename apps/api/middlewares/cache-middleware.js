const redisClient = require('../utils/redis-client');

exports.cache = (duration) => {
  return async (req, res, next) => {
    const key = `__cache__${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        console.log(`Data retried from cache ⚡`);

        return res.status(200).json(cachedResponse);
      }

      res.sendResponse = res.json;
      res.json = async (body) => {
        await redisClient.set(key, JSON.stringify(body), { ex: duration });
        res.sendResponse(body);
      };

      next();
    } catch (err) {
      console.error('Redis cache issue', err);
      next();
    }
  };
};
