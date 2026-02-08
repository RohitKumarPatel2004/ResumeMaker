import fs from 'fs/promises';
import { detectScannedPdf, docxToHtml, docxToPdf, htmlToDocx, pdfToDocx } from './conversion';
import { cleanupFiles, getDocxById, registerDocx } from './fileStore';

export async function processUpload(pdfPath: string) {
  const pdfBuffer = await fs.readFile(pdfPath);
  const warnings: string[] = [];
  if (await detectScannedPdf(pdfBuffer)) {
    warnings.push('Low selectable text detected; OCR may be required.');
  }

  const docxPath = await pdfToDocx(pdfPath);
  const { html, messages } = await docxToHtml(docxPath);
  const fileId = registerDocx(docxPath);

  return {
    html,
    fileId,
    warnings,
    conversionNotes: [
      'Complex tables, columns, and embedded images may lose fidelity during conversion.',
      ...messages
    ]
  };
}

export async function buildOutputFromHtml(html: string, format: 'pdf' | 'docx') {
  const docxPath = await htmlToDocx(html);
  if (format === 'docx') return { format, path: docxPath };
  const pdfPath = await docxToPdf(docxPath);
  await cleanupFiles([docxPath]);
  return { format, path: pdfPath };
}

export function resolveDocxById(fileId: string) {
  return getDocxById(fileId);
}
