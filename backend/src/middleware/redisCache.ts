import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

let isRedisConnected = false;

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  enableAutoPipelining: true,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 100, 2000);
  }
});

redisClient.connect().then(() => {
  isRedisConnected = true;
  console.log('⚡ Redis connected for high-concurrency caching');
}).catch((err) => {
  isRedisConnected = false;
  console.warn('⚠️ Redis offline or unavailable. Bypassing cache layer safely:', err.message);
});

redisClient.on('error', () => {
  isRedisConnected = false;
});

export function redisCacheMiddleware(ttlSeconds: number = 300) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET' || !isRedisConnected) {
      return next();
    }

    const cacheKey = `cache:http:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(cachedData);
        return;
      }

      res.setHeader('X-Cache', 'MISS');
      const originalSend = res.send.bind(res);

      res.send = (body: any): Response => {
        if (res.statusCode >= 200 && res.statusCode < 300 && isRedisConnected) {
          redisClient.setex(cacheKey, ttlSeconds, typeof body === 'string' ? body : JSON.stringify(body))
            .catch(() => {});
        }
        return originalSend(body);
      };

      next();
    } catch (error) {
      next();
    }
  };
}
