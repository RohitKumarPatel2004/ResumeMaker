import type { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit } from '../../lib/rateLimit';
import { parseMultipart, pickFile } from '../../lib/http';
import { processUpload } from '../../lib/services';
import { cleanupFiles, purgeExpired } from '../../lib/fileStore';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!checkRateLimit(req, res)) return;

  try {
    const { files } = await parseMultipart(req);
    const resume = pickFile(files.resume);
    if (!resume) return res.status(400).json({ error: 'Missing resume file' });
    if (resume.mimetype !== 'application/pdf') return res.status(400).json({ error: 'Only PDF uploads are allowed' });

    const result = await processUpload(resume.filepath);
    purgeExpired();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message || 'Upload conversion failed' });
  }
}
