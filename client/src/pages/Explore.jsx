import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Bell, Loader, X, Upload } from 'lucide-react';
import { candidatesAPI, rolesAPI } from '../api/index.js';
import CandidateDetail from './CandidateDetail.jsx';
import UploadModal from '../components/UploadModal.jsx';

export default function Explore() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [viewingCandidateId, setViewingCandidateId] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // ── Reject Modal state ─────────────────────────────────────
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectScope, setRejectScope] = useState('global'); // 'global' | roleId
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Fetch Company Candidates
  useEffect(() => {
    setLoading(true);
    candidatesAPI.getAll()
      .then(res => setCandidates(res.data.candidates || []))
      .catch(err => console.error("Failed to load candidates:", err))
      .finally(() => setLoading(false));
  }, []);

  const displayCandidates = candidates.filter(c => {
    if (!searchKeyword) return true;
    const term = searchKeyword.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.title && c.title.toLowerCase().includes(term)) ||
      (c.company && c.company.toLowerCase().includes(term)) ||
      (c.role?.title && c.role.title.toLowerCase().includes(term))
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === displayCandidates.length && displayCandidates.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayCandidates.map(c => c._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearchKeyword(keyword);
    }
  };

  const openRejectModal = () => {
    if (selectedIds.length === 0) return;
    setRejectModal(true);
    setRejectScope('global');
    if (roles.length === 0) {
      setRolesLoading(true);
      rolesAPI.list()
        .then(res => setRoles(res.data.roles || []))
        .catch(() => {})
        .finally(() => setRolesLoading(false));
    }
  };

  const handleRejectSelected = async () => {
    setRejectModal(false);

    // Determine which candidate IDs to reject based on scope
    let idsToReject = selectedIds;
    if (rejectScope !== 'global') {
      // Only reject candidates belonging to the selected role
      idsToReject = selectedIds.filter(id => {
        const c = candidates.find(c => c._id === id);
        const roleId = c?.role?._id || c?.role;
        return String(roleId) === String(rejectScope);
      });
      if (idsToReject.length === 0) {
        alert('None of the selected candidates belong to that project.');
        return;
      }
    }

    setUpdating(true);
    try {
      await Promise.all(idsToReject.map(id => candidatesAPI.updateStatus(id, { status: 'Rejected' })));
      setCandidates(prev =>
        prev.map(c => idsToReject.includes(c._id) ? { ...c, status: 'Rejected' } : c)
      );
      setSelectedIds([]);
    } catch (err) {
      alert("Failed to reject some candidates");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <UploadModal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        onUploadComplete={() => {
          candidatesAPI.getAll().then(res => setCandidates(res.data.candidates || []));
        }} 
      />

      {/* ── Reject-From-Project Modal ───────────────────────── */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            width: '100%', maxWidth: '480px', padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                Reject {selectedIds.length} candidate{selectedIds.length > 1 ? 's' : ''}
              </h2>
              <button onClick={() => setRejectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              Reject from which project?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {/* Global option */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer',
                border: `2px solid ${rejectScope === 'global' ? '#4F46E5' : '#E5E7EB'}`,
                background: rejectScope === 'global' ? '#EEF2FF' : '#fff',
                transition: 'all 0.15s',
              }}>
                <input
                  type="radio" name="rejectScope" value="global"
                  checked={rejectScope === 'global'}
                  onChange={() => setRejectScope('global')}
                  style={{ accentColor: '#4F46E5' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>All Projects (Global)</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Reject across the entire dataset</div>
                </div>
              </label>

              {/* Per-role options */}
              {rolesLoading ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
                  <Loader size={16} style={{ display: 'inline', marginRight: '0.4rem' }} />
                  Loading projects...
                </div>
              ) : roles.map(role => (
                <label key={role._id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer',
                  border: `2px solid ${rejectScope === role._id ? '#4F46E5' : '#E5E7EB'}`,
                  background: rejectScope === role._id ? '#EEF2FF' : '#fff',
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="radio" name="rejectScope" value={role._id}
                    checked={rejectScope === role._id}
                    onChange={() => setRejectScope(role._id)}
                    style={{ accentColor: '#4F46E5' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{role.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{role.candidateCount || 0} candidates · {role.location}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRejectModal(false)}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontWeight: 500, color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSelected}
                disabled={updating}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                {updating ? 'Rejecting...' : `Reject ${selectedIds.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-header" style={{ padding: '0 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '1.25rem' }}>Global Dataset ({displayCandidates.length})</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: '#4F46E5', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 500 }}
            onClick={() => setUploadModalOpen(true)}
          >
            + Talent
          </button>
          <button className="btn btn-ghost btn-icon" style={{ padding: '0.4rem', color: '#9CA3AF' }}>
            <Bell size={20} />
          </button>
        </div>
      </div>

      <div className="main-body" style={{ padding: '2rem 2.5rem', backgroundColor: '#F8FAFC' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder={"Search By Name or LinkedIn Url"} 
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.75rem', borderRadius: '8px', background: '#fff', border: '1px solid #E5E7EB', fontSize: '0.9rem' }}
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                if (e.target.value === '') setSearchKeyword('');
              }}
              onKeyDown={handleSearch}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {selectedIds.length > 0 && (
              <button 
                className="btn btn-danger" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#EF4444', color: '#fff', border: 'none' }}
                onClick={openRejectModal}
                disabled={updating}
              >
                <Trash2 size={16} /> Reject Selected ({selectedIds.length})
              </button>
            )}
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff' }}>
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                <th style={{ padding: '1rem 1.5rem', width: '60px' }}>
                  <input type="checkbox" checked={displayCandidates.length > 0 && selectedIds.length === displayCandidates.length} onChange={toggleSelectAll} style={{ width: 16, height: 16 }} />
                </th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563' }}>Name</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563' }}>Current Role</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563' }}>Experience</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563' }}>Location</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563' }}>Tags</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563' }}>Core Skills</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Loader size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> 
                      Loading candidates...
                    </div>
                  </td>
                </tr>
              ) : displayCandidates.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                    No candidates found in your global dataset.
                  </td>
                </tr>
              ) : displayCandidates.map(candidate => {
                  // Bug fix: hide "Unknown" / "Unknown Candidate" — fall back to filename
                  const nameStr = (!candidate.name || candidate.name === 'Unknown' || candidate.name === 'Unknown Candidate')
                    ? (candidate.resumeFilename?.replace(/\.[^/.]+$/, '') || '—')
                    : candidate.name;

                  const avatarUrl = candidate.avatar || `https://i.pravatar.cc/150?u=${candidate._id}`;
                  const companyStr = (candidate.role && typeof candidate.role === 'object' && candidate.role.title)
                    ? candidate.role.title
                    : '';
                  
                  // Bug fix: hide "Unknown Role" fallback — show the project role title instead
                  const currentRoleStr = (!candidate.currentRole || candidate.currentRole === 'Unknown Role')
                    ? companyStr
                    : candidate.currentRole;

                  let expStr = '-';
                  if (candidate.yearsOfExperience != null) {
                    expStr = `${candidate.yearsOfExperience} yrs`;
                    if (candidate.monthsOfExperience) {
                      expStr += ` ${candidate.monthsOfExperience} mos`;
                    }
                  }
                  
                  const locationStr = candidate.location || '-';
                  
                  return (
                    <tr 
                      key={candidate._id} 
                      style={{ borderBottom: '1px solid #E5E7EB', transition: 'background 0.2s', background: selectedIds.includes(candidate._id) ? '#F3F4F6' : 'transparent', cursor: 'pointer' }}
                      onClick={(e) => {
                        if (e.target.type !== 'checkbox') setViewingCandidateId(candidate._id);
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <input type="checkbox" checked={selectedIds.includes(candidate._id)} onChange={() => toggleSelect(candidate._id)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={avatarUrl} alt={nameStr} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{nameStr}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{currentRoleStr || '—'}</div>
                        {companyStr && currentRoleStr !== companyStr && <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{companyStr}</div>}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#4B5563' }}>
                        {expStr}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {locationStr}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                           {candidate.status ? (
                             <span style={{
                               background: candidate.status === 'Rejected' ? '#FEE2E2' : '#E0F2FE',
                               color: candidate.status === 'Rejected' ? '#DC2626' : '#0284C7',
                               padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                             }}>
                               {candidate.status === 'Applied' ? '✨ New Applicant' : candidate.status === 'Rejected' ? '🚫 Rejected' : `✨ ${candidate.status}`}
                             </span>
                           ) : '-'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {(!candidate.extractedSkills || candidate.extractedSkills.length === 0) ? (
                            <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>No skills listed</span>
                          ) : (
                            <>
                              {candidate.extractedSkills.slice(0, 2).map((skill, i) => (
                                <span key={i} style={{ background: '#F3F4F6', color: '#4B5563', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {skill}
                                </span>
                              ))}
                              {candidate.extractedSkills.length > 2 && (
                                <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  +{candidate.extractedSkills.length - 2}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
      
      {/* Slide-out Candidate Detail Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: viewingCandidateId ? 0 : '-100%',
        width: '100%',
        maxWidth: '850px',
        height: '100vh',
        background: '#fff',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease-in-out',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {viewingCandidateId && (
          <CandidateDetail 
            candidateId={viewingCandidateId} 
            initialCandidate={candidates.find(c => c._id === viewingCandidateId)}
            onClose={() => setViewingCandidateId(null)} 
          />
        )}
      </div>
      
      {/* Overlay */}
      {viewingCandidateId && (
        <div 
          onClick={() => setViewingCandidateId(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 999
          }}
        />
      )}
    </>
  );
}
