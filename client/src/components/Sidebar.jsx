import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar() {
  const { company, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-brand">
          <span style={{ fontSize: '1.4rem' }}>🌊</span> TalentFlow
        </Link>
      </div>

      <div className="sidebar-menu">
        <Link to="/dashboard" className={`sidebar-item ${location.pathname === '/dashboard' || location.pathname.startsWith('/roles') ? 'active' : ''}`}>
          <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>💼</span>
          Projects
        </Link>
        <Link to="#" className="sidebar-item" onClick={(e) => e.preventDefault()}>
          <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>🔍</span>
          Search
          <span className="sidebar-badge">STACKY</span>
        </Link>
        <Link to="#" className="sidebar-item" onClick={(e) => e.preventDefault()}>
          <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>💬</span>
          Chat History
        </Link>
        <Link to="#" className="sidebar-item" onClick={(e) => e.preventDefault()}>
          <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>👥</span>
          Workspace
        </Link>
        <Link to="#" className="sidebar-item" onClick={(e) => e.preventDefault()}>
          <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>✉️</span>
          Email Accounts
        </Link>
        <Link to="#" className="sidebar-item" onClick={(e) => e.preventDefault()}>
          <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>⚡</span>
          Usage & Billing
        </Link>
      </div>

      {company && (
        <div className="sidebar-footer" onClick={handleLogout} title="Click to sign out">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700, color: '#fff',
            }}>
              {company.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{company.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Recruiting Team</p>
            </div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
        </div>
      )}
    </div>
  );
}
