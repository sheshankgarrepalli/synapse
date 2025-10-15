import Redis from 'ioredis';

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds: number = 300
): Promise<void> {
  if (!redis) return;

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

// Invalidation patterns
export async function invalidateThreadCache(threadId: string): Promise<void> {
  if (!redis) return;

  const patterns = [
    `thread:${threadId}:*`,
    `threads:list:*`, // Invalidate all thread lists
  ];

  for (const pattern of patterns) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

export async function checkRateLimit(
  integration: string,
  organizationId: string,
  cost: number = 1
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  if (!redis) {
    // If Redis is not available, allow all requests
    return {
      allowed: true,
      remaining: 1000,
      resetAt: new Date(Date.now() + 60000),
    };
  }

  const key = `ratelimit:${integration}:${organizationId}`;

  // Get rate limit config for this integration
  const limits: Record<string, { maxCredits: number; windowSeconds: number }> = {
    figma: { maxCredits: 6000, windowSeconds: 60 }, // 6000 credits/minute
    linear: { maxCredits: 1000, windowSeconds: 60 }, // 1000 req/minute
    github: { maxCredits: 5000, windowSeconds: 3600 }, // 5000 req/hour
    slack: { maxCredits: 50, windowSeconds: 60 }, // 50 req/minute (Tier 1)
    notion: { maxCredits: 180, windowSeconds: 60 }, // 3 req/second
    zoom: { maxCredits: 4800, windowSeconds: 60 }, // 80 req/second (Light APIs)
  };

  const limit = limits[integration] || { maxCredits: 1000, windowSeconds: 60 };

  // Token bucket algorithm using Redis
  const now = Date.now();
  const windowStart = Math.floor(now / (limit.windowSeconds * 1000)) * (limit.windowSeconds * 1000);
  const windowKey = `${key}:${windowStart}`;

  try {
    // Get current usage
    const currentUsage = await redis.get(windowKey);
    const used = currentUsage ? parseInt(currentUsage) : 0;

    if (used + cost > limit.maxCredits) {
      // Rate limit exceeded
      const resetAt = new Date(windowStart + limit.windowSeconds * 1000);
      return {
        allowed: false,
        remaining: Math.max(0, limit.maxCredits - used),
        resetAt,
      };
    }

    // Increment usage
    const newUsage = await redis.incrby(windowKey, cost);

    // Set expiration if this is the first increment
    if (newUsage === cost) {
      await redis.expire(windowKey, limit.windowSeconds * 2); // 2x window for safety
    }

    const resetAt = new Date(windowStart + limit.windowSeconds * 1000);

    return {
      allowed: true,
      remaining: limit.maxCredits - newUsage,
      resetAt,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request
    return {
      allowed: true,
      remaining: 1000,
      resetAt: new Date(Date.now() + 60000),
    };
  }
}
