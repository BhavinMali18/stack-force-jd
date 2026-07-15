import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import AppLayout from './components/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RoleCreate from './pages/RoleCreate.jsx';
import RoleDetail from './pages/RoleDetail.jsx';
import RoleEdit from './pages/RoleEdit.jsx';
import Analytics from './pages/Analytics.jsx';
import CandidateDetail from './pages/CandidateDetail.jsx';
import Upload from './pages/Upload.jsx';
import EmailAccounts from './pages/EmailAccounts.jsx';
import Projects from './pages/Projects.jsx';
import Explore from './pages/Explore.jsx';
import TalentPool from './pages/TalentPool.jsx';

// Guard — redirects to /login if not authenticated
function PrivateRoute({ children }) {
  const { company, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return company ? children : <Navigate to="/login" replace />;
}

// Guard — redirects authenticated users away from auth pages
function PublicOnlyRoute({ children }) {
  const { company, loading } = useAuth();
  if (loading) return null;
  return company ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes with old Navbar */}
      <Route path="/" element={<><Navbar /><Landing /></>} />
      <Route path="/login" element={<PublicOnlyRoute><><Navbar /><Auth /></></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><><Navbar /><Auth /></></PublicOnlyRoute>} />

      {/* Protected Routes wrapped in new Sidebar Layout */}
      <Route path="/dashboard" element={<PrivateRoute><AppLayout title="Dashboard"><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute><AppLayout title="Projects (0)"><Projects /></AppLayout></PrivateRoute>} />
      <Route path="/explore" element={<PrivateRoute><AppLayout title="Global Pool"><Explore /></AppLayout></PrivateRoute>} />
      <Route path="/talent-pool" element={<PrivateRoute><AppLayout title="Talent Pool"><TalentPool /></AppLayout></PrivateRoute>} />
      <Route path="/email" element={<PrivateRoute><AppLayout title="Email Accounts"><EmailAccounts /></AppLayout></PrivateRoute>} />
      <Route path="/roles/new" element={<PrivateRoute><AppLayout title="Create Project"><RoleCreate /></AppLayout></PrivateRoute>} />
      <Route path="/roles/:id" element={<PrivateRoute><AppLayout title="Project Details"><RoleDetail /></AppLayout></PrivateRoute>} />
      <Route path="/roles/:id/edit" element={<PrivateRoute><AppLayout title="Edit Project"><RoleEdit /></AppLayout></PrivateRoute>} />
      <Route path="/roles/:id/analytics" element={<PrivateRoute><AppLayout title="Project Analytics"><Analytics /></AppLayout></PrivateRoute>} />
      <Route path="/roles/:id/upload" element={<PrivateRoute><AppLayout title="Upload Resumes"><Upload /></AppLayout></PrivateRoute>} />
      <Route path="/roles/:id/candidates/:cid" element={<PrivateRoute><AppLayout title="Candidate Profile"><CandidateDetail /></AppLayout></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
