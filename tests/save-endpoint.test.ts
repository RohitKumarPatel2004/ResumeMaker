import fs from 'fs/promises';
import path from 'path';
import { buildOutputFromHtml } from '../lib/services';

jest.mock('../lib/conversion', () => ({
  htmlToDocx: jest.fn(async () => path.join(process.cwd(), 'tmp', 'test.docx')),
  docxToPdf: jest.fn(async () => path.join(process.cwd(), 'tmp', 'test.pdf')),
  detectScannedPdf: jest.fn(),
  docxToHtml: jest.fn(),
  pdfToDocx: jest.fn()
}));

describe('save conversion flow', () => {
  beforeAll(async () => {
    await fs.mkdir(path.join(process.cwd(), 'tmp'), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), 'tmp', 'test.docx'), 'docx');
    await fs.writeFile(path.join(process.cwd(), 'tmp', 'test.pdf'), 'pdf');
  });

  it('creates pdf target from html content', async () => {
    const result = await buildOutputFromHtml('<h1>Hello</h1>', 'pdf');
    expect(result.format).toBe('pdf');
    expect(result.path.endsWith('test.pdf')).toBe(true);
  });
});
