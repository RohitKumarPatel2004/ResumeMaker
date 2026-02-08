import { FormEvent, useState } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('../components/Editor'), { ssr: false });

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [html, setHtml] = useState('<p>Upload a resume PDF to begin.</p>');
  const [fileId, setFileId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const uploadPdf = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    const fd = new FormData();
    fd.append('resume', file);
    const response = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      alert(data.error ?? 'Upload failed');
      return;
    }

    setHtml(data.html);
    setFileId(data.fileId);
    setNotes((data.warnings || []).concat(data.conversionNotes || []).join(' | '));
  };

  const downloadPdf = async () => {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, fileId, format: 'pdf' })
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? 'Failed to create PDF');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume_final.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDocx = () => {
    if (!fileId) return;
    window.location.href = `/api/download-docx?fileId=${encodeURIComponent(fileId)}`;
  };

  return (
    <main>
      <div className="card">
        <h1>Resume Maker</h1>
        <form onSubmit={uploadPdf}>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="actions">
            <button type="submit" disabled={loading}>{loading ? 'Converting...' : 'Upload PDF'}</button>
            <button type="button" onClick={downloadPdf} disabled={!fileId || loading}>Download PDF</button>
            <button type="button" onClick={downloadDocx} disabled={!fileId || loading}>Download DOCX</button>
          </div>
        </form>
        {notes ? <p className="notice">{notes}</p> : null}
      </div>
      <div className="card">
        <Editor content={html} onChange={setHtml} />
      </div>
    </main>
  );
}
