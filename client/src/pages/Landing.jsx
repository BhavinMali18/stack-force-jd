import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  { icon: '🚀', title: 'Instant Ranked Shortlist', desc: 'Upload 50,000+ resumes. Get a ranked shortlist with match % in minutes, not days.' },
  { icon: '🧠', title: 'AI-Powered Scoring', desc: 'Advanced semantic AI matching with Gemini 2.5 Flash for deep skill and contextual analysis.' },
  { icon: '📊', title: 'Weighted Skill Rules', desc: 'Configure Must-Haves and Nice-to-Haves. Precise control over what matters most.' },
  { icon: '📤', title: 'Bulk Resume Upload', desc: 'Drag-drop up to 100 PDFs/DOCXs at once. Auto-parsed and scored instantly.' },
  { icon: '🔗', title: 'LinkedIn Enrichment', desc: 'Automatically pull in candidate LinkedIn profiles, work history, and verified skills.' },
  { icon: '📥', title: 'Export Shortlists', desc: 'Download ranked shortlists as CSV or branded PDF reports in seconds.' },
];

const stats = [
  { value: '50K+', label: 'Resumes Processed' },
  { value: '< 1min', label: 'AI Parse & Score Time' },
  { value: '99%', label: 'Uptime SLA' },
];

export default function Landing() {
  const { company } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: '#0a0f1c', minHeight: '100vh', color: '#fff', overflow: 'hidden' }}>
      {/* Decorative Background Glows */}
      <div style={{
        position: 'fixed',
        top: '-20%', left: '-10%', width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 60%)',
        filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none',
        transform: `translateY(${scrollY * 0.2}px)`
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)',
        filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none',
        transform: `translateY(${scrollY * -0.1}px)`
      }} />

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '2rem', position: 'relative', zIndex: 1
      }}>
        <div className="fade-in" style={{ maxWidth: 850 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '0.4rem 1.25rem', borderRadius: '9999px', fontSize: '0.85rem',
            fontWeight: 600, color: '#94a3b8', marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)'
          }}>
            <span style={{ color: '#38bdf8' }}>✨</span> Phase 4 Now Live: AI Scoring & LinkedIn Enrichment
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: 800, lineHeight: 1.1, 
            letterSpacing: '-0.02em', marginBottom: '1.5rem', textShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            Hire Smarter,<br />
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Faster Than Ever
            </span>
          </h1>
          
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#94a3b8', maxWidth: 640,
            margin: '0 auto 3rem', lineHeight: 1.7, fontWeight: 400
          }}>
            Post a role, upload bulk resumes, and let our semantic AI generate a ranked shortlist instantly. 
            Enriched with verified LinkedIn data for total confidence.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {company ? (
              <Link to="/dashboard" className="btn" style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                color: '#fff', padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px',
                border: 'none', boxShadow: '0 8px 25px rgba(37,99,235,0.4)', transition: 'all 0.3s ease'
              }}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn" style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  color: '#fff', padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px',
                  border: 'none', boxShadow: '0 8px 25px rgba(37,99,235,0.4)', transition: 'transform 0.2s'
                }} id="hero-get-started"
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  Start Hiring Free →
                </Link>
                <Link to="/login" className="btn" style={{
                  background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '1rem 2.5rem',
                  fontSize: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '5rem',
            flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem'
          }}>
            {stats.map((s, i) => (
              <div key={s.label} className="fade-in" style={{ textAlign: 'center', animationDelay: `${i * 0.15}s` }}>
                <p style={{
                  fontSize: '2.5rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: '0.25rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}>
                  {s.value}
                </p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 1.5rem', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Everything a recruiter needs.
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: 600, margin: '0 auto' }}>
            From AI-powered semantic matching to verified LinkedIn profile extraction.
          </p>
        </div>
        
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem'
        }}>
          {features.map((f, i) => (
            <div key={f.title} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease', cursor: 'default'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                width: 54, height: 54, borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(129,140,248,0.1) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', marginBottom: '1.5rem', border: '1px solid rgba(129,140,248,0.2)'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>{f.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '8rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1,
        background: 'linear-gradient(180deg, transparent 0%, rgba(37,99,235,0.05) 100%)'
      }}>
        <div style={{
          background: 'radial-gradient(circle at center, rgba(129,140,248,0.15) 0%, transparent 70%)',
          position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none'
        }} />
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, marginBottom: '1rem' }}>
          Ready to cut your time-to-shortlist by 90%?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: 500, margin: '0 auto 3rem' }}>
          No credit card required. Just upload resumes and let the AI do the heavy lifting.
        </p>
        <Link to="/register" className="btn" style={{
          background: '#fff', color: '#0f172a', padding: '1.25rem 3rem',
          fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(255,255,255,0.15)', textDecoration: 'none',
          transition: 'all 0.3s ease', display: 'inline-block'
        }} id="cta-get-started"
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          Create Free Account →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 1.5rem',
        textAlign: 'center', position: 'relative', zIndex: 1, background: '#0a0f1c'
      }}>
        <p style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
          © 2026 TalentForce JD — Recruiter Portal. Phase 4.
        </p>
      </footer>
    </div>
  );
}
