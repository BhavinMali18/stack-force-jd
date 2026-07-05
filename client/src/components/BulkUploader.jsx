import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function BulkUploader({ onUpload, uploading = false }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((accepted) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const newFiles = accepted.filter((f) => !existing.has(f.name));
      return [...prev, ...newFiles];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    multiple: true,
    disabled: uploading,
  });

  const removeFile = (name) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleUpload = () => {
    if (!files.length || uploading) return;
    const formData = new FormData();
    files.forEach((f) => formData.append('resumes', f));
    onUpload(formData, () => setFiles([]));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone${isDragActive ? ' active' : ''}`}
        style={{ opacity: uploading ? 0.6 : 1 }}
      >
        <input {...getInputProps()} />
        <div className="dropzone-icon">{isDragActive ? '📂' : '☁️'}</div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          {isDragActive ? 'Drop resumes here...' : 'Drag & drop resumes here'}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          PDF, DOCX up to 10 MB each — up to 100 files at once
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '1rem', pointerEvents: 'none' }}
        >
          Browse files
        </button>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {files.length} file{files.length > 1 ? 's' : ''} ready
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear all
            </button>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {files.map((f) => (
              <div key={f.name} className="file-item">
                <span style={{ fontSize: '1.1rem' }}>
                  {f.name.endsWith('.pdf') ? '📄' : '📝'}
                </span>
                <span className="file-item-name">{f.name}</span>
                <span className="file-item-size">{formatSize(f.size)}</span>
                {!uploading && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => removeFile(f.name)}
                    style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
          >
            {uploading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Processing resumes...
              </>
            ) : (
              <>
                ⚡ Parse & Score {files.length} Resume{files.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
