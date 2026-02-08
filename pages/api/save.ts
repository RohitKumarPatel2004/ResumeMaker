import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit } from '../../lib/rateLimit';
import { buildOutputFromHtml } from '../../lib/services';
import { cleanupFiles } from '../../lib/fileStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!checkRateLimit(req, res)) return;

  try {
    const { html, format = 'pdf' } = req.body as { html?: string; format?: 'pdf' | 'docx' };
    if (!html || typeof html !== 'string') return res.status(400).json({ error: 'html is required' });

    const output = await buildOutputFromHtml(html, format);
    const binary = await fs.readFile(output.path);
    res.setHeader('Content-Type', output.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=resume_final.${output.format}`);
    res.status(200).send(binary);
    await cleanupFiles([output.path]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message || 'Save conversion failed' });
  }
}
