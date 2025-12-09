// frontend/src/App.js - UPDATED WITH FORGOT PASSWORD
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import PatientDashboard from './pages/PatientDashboard';
import ClinicianDashboard from './pages/ClinicianDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>🏥 Home Health System</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (showForgotPassword) {
      return <ForgotPassword />;
    }
    return <Login onLogin={handleLogin} onForgotPassword={() => setShowForgotPassword(true)} />;
  }

  switch (user.role) {
    case 'patient':
      return <PatientDashboard user={user} onLogout={handleLogout} />;
    case 'clinician':
      return <ClinicianDashboard user={user} onLogout={handleLogout} />;
    case 'admin':
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    default:
      return (
        <div className="error-screen">
          <h2>Invalid user role</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      );
  }
}

export default App;