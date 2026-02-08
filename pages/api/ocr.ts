import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import Tesseract from 'tesseract.js';
import { parseMultipart, pickFile } from '../../lib/http';
import { htmlToDocx } from '../../lib/conversion';
import { registerDocx } from '../../lib/fileStore';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { files } = await parseMultipart(req);
    const source = pickFile(files.file);
    if (!source) return res.status(400).json({ error: 'file is required' });

    // OCR endpoint is intentionally optional and best-effort; for PDFs, convert to image upstream for stronger results.
    const { data } = await Tesseract.recognize(source.filepath, 'eng');
    const html = `<h1>OCR Draft</h1><p>${data.text.replace(/\n/g, '</p><p>')}</p>`;
    const docxPath = await htmlToDocx(html);
    const fileId = registerDocx(docxPath);
    await fs.unlink(source.filepath).catch(() => undefined);

    res.status(200).json({ html, fileId, conversionNotes: ['OCR output is draft quality and usually needs manual cleanup.'] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message || 'OCR failed' });
  }
}
