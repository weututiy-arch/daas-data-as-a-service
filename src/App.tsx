/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import HireFromUs from './pages/HireFromUs';
import Login from './pages/Login';
import LoginSuccess from './pages/LoginSuccess';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { UserRole } from './types/auth';

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles?: UserRole[] 
}) => {
  const location = useLocation();
  const { user, status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Placeholder components for other pages
const About = () => <div className="pt-32 pb-20 text-center bg-brand-bg min-h-screen transition-colors duration-300"><h1 className="text-brand-text text-4xl font-bold">About Us Page Coming Soon</h1></div>;
const Contact = () => <div className="pt-32 pb-20 text-center bg-brand-bg min-h-screen transition-colors duration-300"><h1 className="text-brand-text text-4xl font-bold">Contact Page Coming Soon</h1></div>;

export default function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-brand-bg transition-colors duration-300">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/hire" element={<HireFromUs />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login-success" element={<LoginSuccess />} />
              
              {/* Protected Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/portal" 
                element={
                  <ProtectedRoute allowedRoles={['employee', 'admin']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
