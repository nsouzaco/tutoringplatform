import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import Tutors from './pages/Tutors';
import SessionRoom from './pages/SessionRoom';
import PastSessions from './pages/PastSessions';
import Admin from './pages/Admin';
import AdminTutorDetail from './pages/AdminTutorDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/availability" 
              element={
                <PrivateRoute requireRole="TUTOR">
                  <Availability />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/tutors" 
              element={
                <PrivateRoute requireRole="STUDENT">
                  <Tutors />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/session/:id" 
              element={
                <PrivateRoute>
                  <SessionRoom />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/past-sessions" 
              element={
                <PrivateRoute>
                  <PastSessions />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/admin" 
              element={
                <PrivateRoute requireRole="ADMIN">
                  <Admin />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/admin/tutor/:tutorId" 
              element={
                <PrivateRoute requireRole="ADMIN">
                  <AdminTutorDetail />
                </PrivateRoute>
              } 
            />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
