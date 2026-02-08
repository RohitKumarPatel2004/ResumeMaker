import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit } from '../../lib/rateLimit';
import { resolveDocxById } from '../../lib/services';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!checkRateLimit(req, res)) return;

  const fileId = req.query.fileId;
  if (typeof fileId !== 'string') return res.status(400).json({ error: 'fileId is required' });
  const record = resolveDocxById(fileId);
  if (!record) return res.status(404).json({ error: 'fileId not found or expired' });

  const binary = await fs.readFile(record.docxPath);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', 'attachment; filename=resume.docx');
  res.status(200).send(binary);
}
