import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rolesAPI, candidatesAPI } from '../api/index.js';
import BulkUploader from '../components/BulkUploader.jsx';

export default function Upload() {
  const { id: roleId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    rolesAPI.get(roleId)
      .then((res) => setRole(res.data.role))
      .catch(() => setError('Role not found'))
      .finally(() => setLoading(false));
  }, [roleId]);

  const handleUpload = async (formData, onComplete) => {
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const res = await candidatesAPI.upload(roleId, formData);
      setResult(res.data);
      onComplete?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
      <div className="container" style={{ maxWidth: 680 }}>
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

        {/* Result card */}
        {result && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚡</span> Upload Complete
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { label: 'Processed', value: result.processed, color: 'var(--success)' },
                { label: 'Failed', value: result.failed, color: result.failed > 0 ? 'var(--danger)' : 'var(--text-muted)' },
                { label: 'Total', value: result.processed + result.failed, color: 'var(--accent-light)' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {result.errors?.length > 0 && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Failed files:</p>
                {result.errors.map((e) => (
                  <p key={e.file} style={{ fontSize: '0.8rem' }}>• {e.file}: {e.error}</p>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/roles/${roleId}`)}
              >
                View Shortlist →
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setResult(null)}
              >
                Upload More
              </button>
            </div>
          </div>
        )}

        {/* Uploader */}
        {!result && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.4rem' }}>Bulk Resume Upload</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Each resume will be automatically parsed, skill-matched against the role requirements, and scored.
              </p>
            </div>

            {/* How it works */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              {['📄 Parse text', '🔍 Extract skills', '📊 Score & rank', '✅ Add to shortlist'].map((step, i) => (
                <React.Fragment key={step}>
                  <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    {i + 1}. {step}
                  </span>
                  {i < 3 && <span style={{ color: 'var(--text-muted)', alignSelf: 'center', fontSize: '0.75rem' }}>→</span>}
                </React.Fragment>
              ))}
            </div>

            <BulkUploader onUpload={handleUpload} uploading={uploading} />
          </div>
        )}
      </div>
    </div>
  );
}
