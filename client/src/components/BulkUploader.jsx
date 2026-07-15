/**
 * BulkUploader.jsx — Queue-Aware Version
 * ─────────────────────────────────────────────────────────────
 * Implements the Netflix-scale upload UX:
 *   1. Drop files → instant presigned upload to storage (no blocking)
 *   2. Real-time progress bar as worker processes resumes in background
 *   3. Live feed showing candidates as they finish processing
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadQueue } from '../hooks/useUploadQueue.js';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function BulkUploader({ roleId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const {
    startUpload, reset,
    total, uploaded, processed, failed,
    isUploading, isProcessing, overallProgress,
    liveResults, uploadError, isDone,
  } = useUploadQueue(roleId);

  const isActive = isUploading || isProcessing;

  const onDrop = useCallback((accepted) => {
    if (isActive) return;
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...accepted.filter((f) => !existing.has(f.name))];
    });
  }, [isActive]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    multiple: true,
    disabled: isActive,
  });

  const handleStart = async () => {
    if (!files.length || isActive) return;
    await startUpload(files);
  };

  const handleReset = () => {
    reset();
    setFiles([]);
    if (isDone && onUploadComplete) onUploadComplete();
  };

  // ── Active processing UI ───────────────────────────────────
  if (isActive || (total > 0 && !isDone)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Architecture badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem',
          fontSize: '0.78rem', color: 'var(--accent-light)', alignSelf: 'flex-start',
        }}>
          ⚡ Distributed Queue — BullMQ + Socket.io
        </div>

        {/* Dual-phase progress bar */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
              {isUploading ? '📤 Uploading to queue...' : '⚙️ Worker processing resumes...'}
            </span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-light)' }}>
              {overallProgress}%
            </span>
          </div>

          {/* Combined progress bar */}
          <div style={{ height: 12, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden', position: 'relative' }}>
            {/* Upload phase (left half) */}
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: `${Math.round((uploaded / (total || 1)) * 50)}%`,
              background: 'var(--accent)', transition: 'width 0.3s ease',
            }} />
            {/* Processing phase (right half, starts from 50%) */}
            <div style={{
              position: 'absolute', left: `${Math.round((uploaded / (total || 1)) * 50)}%`, top: 0, height: '100%',
              width: `${Math.round((processed / (total || 1)) * 50)}%`,
              background: 'var(--success)', transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Phase stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
            {[
              { label: '📤 Queued', value: uploaded, color: 'var(--accent-light)' },
              { label: '✅ Processed', value: processed, color: 'var(--success)' },
              { label: '❌ Failed', value: failed, color: failed > 0 ? 'var(--danger)' : 'var(--text-muted)' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                <p style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
            {isUploading
              ? `Transferring ${uploaded}/${total} files to queue...`
              : `Worker parsing resumes... ${processed}/${total} complete`}
          </p>
        </div>

        {/* Live results feed */}
        {liveResults.length > 0 && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              🔴 Live Feed — candidates appearing as they process
            </p>
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {liveResults.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.4rem 0.6rem', background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.82rem',
                  animation: 'fadeIn 0.3s ease',
                }}>
                  <span style={{ color: 'var(--text-primary)' }}>👤 {r.name || 'Unknown'}</span>
                  <span style={{
                    fontWeight: 700,
                    color: r.score >= 80 ? 'var(--success)' : r.score >= 50 ? 'var(--warning)' : 'var(--danger)',
                  }}>
                    {r.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Done state ─────────────────────────────────────────────
  if (isDone) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
        <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          {processed} resumes processed!
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {failed > 0 ? `${failed} files failed. ` : ''}
          All candidates are now ranked and ready.
        </p>
        <button className="btn btn-primary" onClick={handleReset}>
          Upload More
        </button>
      </div>
    );
  }

  // ── Default dropzone UI ────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Architecture info strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem', fontSize: '0.8rem',
      }}>
        <span>⚡</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-light)' }}>Distributed Queue</strong>
          {' '}— files upload directly to storage, worker parses async with real-time progress
        </span>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone${isDragActive ? ' active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-icon">{isDragActive ? '📂' : '☁️'}</div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          {isDragActive ? 'Drop resumes here...' : 'Drag & drop resumes here'}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          PDF, DOCX, TXT — up to 5,000 files at once
        </p>
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem', pointerEvents: 'none' }}>
          Browse files
        </button>
      </div>

      {/* File list + upload button */}
      {files.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {files.length} file{files.length > 1 ? 's' : ''} ready
            </p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFiles([])}>
              Clear all
            </button>
          </div>

          <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {files.slice(0, 50).map((f) => (
              <div key={f.name} className="file-item">
                <span style={{ fontSize: '1.1rem' }}>{f.name.endsWith('.pdf') ? '📄' : '📝'}</span>
                <span className="file-item-name">{f.name}</span>
                <span className="file-item-size">{formatSize(f.size)}</span>
                <button
                  type="button" className="btn btn-ghost btn-icon"
                  onClick={() => setFiles((p) => p.filter((x) => x.name !== f.name))}
                  style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem' }}
                >✕</button>
              </div>
            ))}
            {files.length > 50 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.5rem' }}>
                + {files.length - 50} more files...
              </p>
            )}
          </div>

          {uploadError && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
              ❌ {uploadError}
            </p>
          )}

          <button
            type="button" className="btn btn-primary"
            onClick={handleStart}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
          >
            ⚡ Queue {files.length} Resume{files.length > 1 ? 's' : ''} for Processing
          </button>
        </div>
      )}
    </div>
  );
}
