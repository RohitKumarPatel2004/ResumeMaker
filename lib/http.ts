import type { NextApiRequest } from 'next';
import formidable, { type File } from 'formidable';
import { config } from './config';
import { ensureTempDir } from './fileStore';

export async function parseMultipart(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  await ensureTempDir();
  const form = formidable({ uploadDir: config.tempDir, multiples: false, maxFileSize: config.maxUploadBytes, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export function pickFile(input: File | File[] | undefined): File | undefined {
  if (!input) return undefined;
  return Array.isArray(input) ? input[0] : input;
}
