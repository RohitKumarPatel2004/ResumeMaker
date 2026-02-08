import type { NextApiRequest, NextApiResponse } from 'next';
import { config } from './config';

const bucket = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(req: NextApiRequest, res: NextApiResponse): boolean {
  const key = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const existing = bucket.get(key);
  if (!existing || now > existing.resetAt) {
    bucket.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (existing.count >= config.rateLimitPerMinute) {
    res.status(429).json({ error: 'Rate limit exceeded' });
    return false;
  }
  existing.count += 1;
  return true;
}
