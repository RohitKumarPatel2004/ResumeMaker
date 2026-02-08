import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { config } from './config';

export type FileRecord = { docxPath: string; createdAt: number };
const fileMap = new Map<string, FileRecord>();

export async function ensureTempDir() {
  await fs.mkdir(config.tempDir, { recursive: true });
}

export function registerDocx(docxPath: string): string {
  const fileId = uuid();
  fileMap.set(fileId, { docxPath, createdAt: Date.now() });
  return fileId;
}

export function getDocxById(fileId: string): FileRecord | undefined {
  return fileMap.get(fileId);
}

export async function cleanupFiles(paths: string[]) {
  await Promise.all(paths.map(async (filePath) => {
    try { await fs.unlink(filePath); } catch { /* ignore cleanup failures */ }
  }));
}

export function purgeExpired(ttlMs = 1000 * 60 * 30) {
  const now = Date.now();
  for (const [id, record] of fileMap.entries()) {
    if (now - record.createdAt > ttlMs) {
      fileMap.delete(id);
      cleanupFiles([record.docxPath]);
    }
  }
}

export function extensionPath(fileName: string) {
  return path.join(config.tempDir, `${uuid()}-${fileName}`);
}
