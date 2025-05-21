import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeLangProvider } from './context/ThemeLangContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Auth Components
import CitizenLogin from './components/auth/CitizenLogin';
import CitizenRegister from './components/auth/CitizenRegister';
import CitizenForgotPassword from './components/auth/CitizenForgotPassword';
import AuthorityLogin from './components/auth/AuthorityLogin';
import AuthorityRegister from './components/auth/AuthorityRegister';
import AuthorityForgotPassword from './components/auth/AuthorityForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Dashboard Components
import CitizenDashboard from './components/dashboard/CitizenDashboard';
import AuthorityDashboard from './components/dashboard/AuthorityDashboard';

function App() {
  return (
    <ThemeLangProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/citizen/login" replace />} />
              
              {/* Citizen Auth Routes */}
              <Route path="/citizen/login" element={<CitizenLogin />} />
              <Route path="/citizen/register" element={<CitizenRegister />} />
              <Route path="/citizen/forgot-password" element={<CitizenForgotPassword />} />
              
              {/* Authority Auth Routes */}
              <Route path="/authority/login" element={<AuthorityLogin />} />
              <Route path="/authority/register" element={<AuthorityRegister />} />
              <Route path="/authority/forgot-password" element={<AuthorityForgotPassword />} />
              
              {/* Shared Auth Routes */}
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route
                path="/citizen/dashboard/*"
                element={
                  <PrivateRoute role="citizen">
                    <CitizenDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/authority/dashboard/*"
                element={
                  <PrivateRoute role="authority">
                    <AuthorityDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeLangProvider>
  );
}

export default App; 