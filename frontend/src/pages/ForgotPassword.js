// frontend/src/pages/ForgotPassword.js - UPDATED
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setMessage(response.data.message);
      
      // For development - auto-fill token if returned
      if (response.data.resetToken) {
        setToken(response.data.resetToken);
      }
      
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword
      });
      setMessage(response.data.message);
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🏥 Home Health System</h2>
        <h3>Forgot Password</h3>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestReset}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#7f8c8d' }}>
              Enter your email address and we'll send you a password reset link
            </p>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
            <div className="auth-toggle">
              <p>
                Remember your password?{' '}
                <span onClick={() => window.location.href = '/'}>Login here</span>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#7f8c8d' }}>
              Check your email for the reset token, or enter it below
            </p>
            
            <div className="info-box">
              <p>📧 <strong>Email sent to:</strong> {email}</p>
              <p>⏰ Token expires in 1 hour</p>
              <p>💡 Check your spam folder if you don't see the email</p>
            </div>

            <input
              type="text"
              placeholder="Reset Token (from email)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            <div className="auth-toggle">
              <p>
                Didn't receive email?{' '}
                <span onClick={() => setStep(1)}>Try again</span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;