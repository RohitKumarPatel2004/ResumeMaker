import path from 'path';
import { processUpload } from '../lib/services';

jest.mock('../lib/conversion', () => {
  const actual = jest.requireActual('../lib/conversion');
  return {
    ...actual,
    pdfToDocx: jest.fn(async () => '/tmp/fake.docx'),
    docxToHtml: jest.fn(async () => ({ html: '<h2>Experience</h2><h2>Education</h2>', messages: [] }))
  };
});

describe('upload conversion flow', () => {
  it('processes sample pdf and yields editable HTML headings', async () => {
    const samplePath = path.join(process.cwd(), 'data', 'sample_resume.pdf');
    const result = await processUpload(samplePath);
    expect(result.html).toContain('Experience');
    expect(result.html).toContain('Education');
  });
});
