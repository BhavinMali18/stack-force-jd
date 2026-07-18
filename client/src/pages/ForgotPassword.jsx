import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/index.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await authAPI.forgotPassword({ email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: 400 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Forgot Password</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && <div style={{ background: '#ECFDF5', color: '#047857', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{message}</div>}
        {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          Remember your password? <Link to="/login" style={{ color: '#4F46E5', fontWeight: 500 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}
