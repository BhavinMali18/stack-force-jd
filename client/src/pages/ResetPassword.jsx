import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/index.js';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.resetPassword(token, { password });
      setSuccess(true);
      
      // Save company basic info (since reset logs them in directly)
      localStorage.setItem('sf_company', JSON.stringify(res.data.company));
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg);
      } else {
        setError(err.response?.data?.message || 'Invalid or expired token.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: 400 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Reset Password</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Please enter your new password below.
        </p>

        {success ? (
          <div style={{ background: '#ECFDF5', color: '#047857', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Password Reset Successful!</h4>
            <p style={{ fontSize: '0.85rem' }}>Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>New Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>Confirm New Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
