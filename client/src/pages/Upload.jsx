/**
 * Upload.jsx — Queue-Enabled Version
 * Uses the new BulkUploader which implements the distributed
 * presign → direct-upload → BullMQ → Socket.io real-time flow.
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rolesAPI } from '../api/index.js';
import BulkUploader from '../components/BulkUploader.jsx';

export default function Upload() {
  const { id: roleId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    rolesAPI.get(roleId)
      .then((res) => setRole(res.data.role))
      .catch(() => setError('Role not found'))
      .finally(() => setLoading(false));
  }, [roleId]);

  if (loading) return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="skeleton" style={{ height: 32, width: '50%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/dashboard" style={{ color: 'var(--accent-light)' }}>Dashboard</Link>
          <span>/</span>
          <Link to={`/roles/${roleId}`} style={{ color: 'var(--accent-light)' }}>{role?.title}</Link>
          <span>/</span>
          <span>Upload Resumes</span>
        </div>

        <div className="page-header">
          <h1>Upload Resumes</h1>
          <p>
            Uploading to: <strong style={{ color: 'var(--text-primary)' }}>{role?.title}</strong><br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Required skills: {role?.requiredSkills?.join(', ') || 'None defined'}
            </span>
          </p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        {/* Architecture explanation */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.5rem', marginBottom: '1.5rem',
        }}>
          {[
            { icon: '📤', label: 'Presign', desc: 'Get upload tokens' },
            { icon: '☁️', label: 'Direct Upload', desc: 'Files → Storage' },
            { icon: '⚙️', label: 'Worker Queue', desc: 'Async processing' },
            { icon: '📡', label: 'Live Updates', desc: 'Socket.io push' },
          ].map((step, i) => (
            <div key={step.label} style={{
              textAlign: 'center', padding: '0.75rem 0.5rem',
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', position: 'relative',
            }}>
              {i < 3 && (
                <div style={{
                  position: 'absolute', right: '-0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  fontSize: '0.8rem', zIndex: 1,
                }}>→</div>
              )}
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{step.icon}</div>
              <p style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{step.label}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.4rem' }}>Bulk Resume Upload</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Files upload directly to the queue — processing happens asynchronously
              with real-time Socket.io updates. Supports up to 5,000 resumes at once.
            </p>
          </div>

          {/* The new queue-aware BulkUploader */}
          <BulkUploader
            roleId={roleId}
            onUploadComplete={() => navigate(`/roles/${roleId}`)}
          />
        </div>
      </div>
    </div>
  );
}
