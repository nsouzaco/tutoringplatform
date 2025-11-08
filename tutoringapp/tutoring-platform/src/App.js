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

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
