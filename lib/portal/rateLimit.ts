type Counter = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Counter>();

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const counter = buckets.get(key);

  if (!counter || now > counter.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (counter.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: counter.resetAt };
  }

  counter.count += 1;
  buckets.set(key, counter);
  return { allowed: true, remaining: Math.max(0, limit - counter.count), resetAt: counter.resetAt };
}

