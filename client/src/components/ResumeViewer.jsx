import React from 'react';

export default function ResumeViewer({ resumeUrl }) {
  if (!resumeUrl) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: '1rem', color: 'var(--text-muted)',
      }}>
        <span style={{ fontSize: '3rem', opacity: 0.4 }}>📄</span>
        <p>No resume available</p>
      </div>
    );
  }

  const isPDF = resumeUrl.toLowerCase().endsWith('.pdf');

  if (isPDF) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            ↗ Open in new tab
          </a>
        </div>
        <iframe
          src={resumeUrl}
          style={{
            flex: 1,
            width: '100%',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: '#fff',
          }}
          title="Resume Preview"
        />
      </div>
    );
  }

  // DOCX — can't embed, show download link
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: '1.25rem', color: 'var(--text-muted)',
    }}>
      <span style={{ fontSize: '4rem' }}>📝</span>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>DOCX Preview</p>
      <p style={{ fontSize: '0.875rem', textAlign: 'center', maxWidth: 280 }}>
        DOCX files can't be previewed in-browser. Download to view.
      </p>
      <a
        href={resumeUrl}
        download
        className="btn btn-primary"
      >
        ⬇ Download Resume
      </a>
    </div>
  );
}
