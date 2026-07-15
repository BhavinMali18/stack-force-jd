import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Briefcase, Search, Bell } from 'lucide-react';

export default function Dashboard() {
  const { company } = useAuth();

  return (
    <>
      <div className="main-header" style={{ padding: '0 2.5rem', borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Header left empty to match design or keep breadcrumb if needed */}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="btn btn-ghost btn-icon" style={{ padding: '0.4rem', color: '#9CA3AF' }}>
            <Bell size={20} />
          </button>
        </div>
      </div>

      <div className="main-body" style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Welcome Section */}
        <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 4rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', backgroundColor: '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '2rem'
          }}>
            👋
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
            Welcome, {company?.name || 'Bhavin Mali'}!
          </h1>
          <p style={{ fontSize: '1rem', color: '#6B7280', lineHeight: 1.6 }}>
            Start by creating a project to manage your talent, or explore your entire candidate database with advanced filters to find the best matches.
          </p>
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem', width: '100%', maxWidth: 900
        }}>
          {/* Create Project Card */}
          <Link to="/projects" style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              height: '100%', border: '1px solid #E5E7EB', borderRadius: '16px',
              transition: 'all 0.2s', cursor: 'pointer', background: '#F9FAFB'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4F46E5'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                  Create Project
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.5 }}>
                  Set up a job role you want to hire for. Projects help you manage talent, campaigns, and hiring progress in one place.
                </p>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', opacity: 0.8 }}>
                {/* Simulated illustration placeholder to match design */}
                <div style={{ width: 120, height: 80, background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', borderRadius: '12px', transform: 'rotate(-5deg)' }}></div>
              </div>
            </div>
          </Link>

          {/* Explore Talent Pool Card */}
          <Link to="/explore" style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              height: '100%', border: '1px solid #E5E7EB', borderRadius: '16px',
              transition: 'all 0.2s', cursor: 'pointer', background: '#F9FAFB'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4F46E5'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                  Explore Your Talent Pool
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.5 }}>
                  Browse your candidate database with advanced filters. Search by skills, experience, location, and more.
                </p>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', opacity: 0.8 }}>
                {/* Simulated illustration placeholder to match design */}
                <div style={{ width: 120, height: 80, background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', borderRadius: '12px', transform: 'rotate(5deg)' }}></div>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </>
  );
}
