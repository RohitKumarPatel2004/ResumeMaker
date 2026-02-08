import path from 'path';

export const config = {
  tempDir: process.env.TEMP_DIR || path.join(process.cwd(), 'tmp'),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024),
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE || 30)
};
