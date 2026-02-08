import fs from 'fs/promises';
import path from 'path';
import { processUpload, buildOutputFromHtml } from '../lib/services';
import { ensureTempDir, cleanupFiles } from '../lib/fileStore';

async function run() {
  await ensureTempDir();
  const sample = path.join(process.cwd(), 'data', 'sample_resume.pdf');
  const tmpPdf = path.join(process.cwd(), 'tmp', `smoke-${Date.now()}.pdf`);
  await fs.copyFile(sample, tmpPdf);

  const upload = await processUpload(tmpPdf);
  const output = await buildOutputFromHtml(upload.html, 'pdf');

  await fs.mkdir(path.join(process.cwd(), 'out'), { recursive: true });
  const target = path.join(process.cwd(), 'out', 'resume_final.pdf');
  await fs.copyFile(output.path, target);

  await cleanupFiles([tmpPdf, output.path]);
  console.log(`Smoke chain done: ${target}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
