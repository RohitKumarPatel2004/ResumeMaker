# ResumeMaker

Production-focused, minimal Next.js + TypeScript resume editor that keeps all conversions server-side.

## Features
- Upload PDF resume from browser.
- Server converts PDF -> DOCX (LibreOffice headless), then DOCX -> HTML (`mammoth`).
- Edit HTML in a TipTap WYSIWYG editor.
- Download final PDF (preferred DOCX -> PDF via LibreOffice; fallback via Puppeteer HTML -> PDF).
- Download DOCX version.
- Optional OCR endpoint (`/api/ocr`) using `tesseract.js`.
- Temp file cleanup, max upload size validation, mime validation, basic in-memory rate limiting.

## Tech stack
- Next.js pages router + API routes
- TypeScript across frontend/backend
- TipTap editor
- Conversion libraries: `mammoth`, `html-docx-js`, LibreOffice (`soffice`), Puppeteer fallback

## Project structure
- `pages/index.tsx` UI for upload/edit/download
- `components/Editor.tsx` TipTap editor wrapper
- `pages/api/upload.ts` PDF -> DOCX -> HTML
- `pages/api/save.ts` edited HTML -> DOCX -> PDF/DOCX
- `pages/api/download-docx.ts` fetch stored DOCX by fileId
- `pages/api/ocr.ts` OCR draft endpoint
- `lib/` conversion and temp-file helpers
- `tests/` Jest tests for conversion endpoint flows
- `scripts/smoke.ts` full conversion chain script

## Local run (without Docker)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Install LibreOffice and Chromium dependencies:
   - Ubuntu/Debian:
     ```bash
     sudo apt-get update
     sudo apt-get install -y libreoffice fonts-dejavu-core
     ```
3. Optional env vars:
   ```bash
   export TEMP_DIR=./tmp
   export MAX_UPLOAD_BYTES=10485760
   export RATE_LIMIT_PER_MINUTE=30
   ```
4. Start app:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

## Docker run
```bash
docker compose up --build
```

## API quick checks (cURL)
Upload resume:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "resume=@data/sample_resume.pdf"
```

Save edited HTML as PDF:
```bash
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Experience</h1><p>Example</p>","format":"pdf"}' \
  --output out/resume_final.pdf
```

Save edited HTML as DOCX:
```bash
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Education</h1><p>University</p>","format":"docx"}' \
  --output out/resume_final.docx
```

OCR draft endpoint:
```bash
curl -X POST http://localhost:3000/api/ocr -F "file=@scan.png"
```

## Tests
```bash
npm test
```

## Smoke end-to-end chain
```bash
npm run smoke
```
Produces `out/resume_final.pdf`.

## Production improvement ideas
- Replace in-memory file map/rate-limiter with Redis for multi-instance deployments.
- Add queue worker (BullMQ) for heavy conversions.
- Add antivirus scanning for uploaded files.
- Improve OCR for PDF by rasterizing pages first, then running OCR per page.
- Add auth and object storage (S3/GCS) for persistent download links.
