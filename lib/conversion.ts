import fs from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';
import mammoth from 'mammoth';
import htmlDocx from 'html-docx-js';
import pdfParse from 'pdf-parse';
import puppeteer from 'puppeteer';
import { extensionPath } from './fileStore';

// LibreOffice is used first for fidelity, Puppeteer remains a fallback for HTML -> PDF rendering.
async function sofficeConvert(inputPath: string, targetExt: 'pdf' | 'docx'): Promise<string> {
  const outDir = path.dirname(inputPath);
  await new Promise<void>((resolve, reject) => {
    const proc = spawn('soffice', ['--headless', '--convert-to', targetExt, '--outdir', outDir, inputPath]);
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`soffice exit ${code}`))));
  });
  const outPath = path.join(outDir, `${path.parse(inputPath).name}.${targetExt}`);
  return outPath;
}

export async function pdfToDocx(pdfPath: string): Promise<string> {
  return sofficeConvert(pdfPath, 'docx');
}

export async function docxToHtml(docxPath: string) {
  const result = await mammoth.convertToHtml({ path: docxPath });
  return { html: result.value, messages: result.messages.map((m) => m.message) };
}

export async function htmlToDocx(html: string): Promise<string> {
  const docxBuffer = htmlDocx.asBlob(`<!doctype html><html><body>${html}</body></html>`) as Blob;
  const arrayBuffer = await docxBuffer.arrayBuffer();
  const outPath = extensionPath('edited.docx');
  await fs.writeFile(outPath, Buffer.from(arrayBuffer));
  return outPath;
}

export async function docxToPdf(docxPath: string): Promise<string> {
  try {
    return await sofficeConvert(docxPath, 'pdf');
  } catch {
    return htmlToPdfWithPuppeteer(await docxToHtml(docxPath).then((r) => r.html));
  }
}

export async function htmlToPdfWithPuppeteer(html: string): Promise<string> {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const output = extensionPath('puppeteer.pdf');
    await page.pdf({ path: output, format: 'A4', printBackground: true });
    return output;
  } finally {
    await browser.close();
  }
}

export async function detectScannedPdf(pdfBuffer: Buffer): Promise<boolean> {
  const result = await pdfParse(pdfBuffer);
  return !result.text || result.text.trim().length < 40;
}
