import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RoleCreate from './pages/RoleCreate.jsx';
import RoleDetail from './pages/RoleDetail.jsx';
import RoleEdit from './pages/RoleEdit.jsx';
import Analytics from './pages/Analytics.jsx';
import CandidateDetail from './pages/CandidateDetail.jsx';
import Upload from './pages/Upload.jsx';

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
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />

        {/* Protected */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/roles/new" element={<PrivateRoute><RoleCreate /></PrivateRoute>} />
        <Route path="/roles/:id" element={<PrivateRoute><RoleDetail /></PrivateRoute>} />
        <Route path="/roles/:id/edit" element={<PrivateRoute><RoleEdit /></PrivateRoute>} />
        <Route path="/roles/:id/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/roles/:id/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
        <Route path="/roles/:id/candidates/:cid" element={<PrivateRoute><CandidateDetail /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
