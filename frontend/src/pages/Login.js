// frontend/src/pages/Login.js - UPDATED
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

function Login({ onLogin, onForgotPassword }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'patient',
    age: '',
    condition: '',
    address: '',
    specialization: '',
    licenseNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API_URL}${endpoint}`, formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🏥 Home Health System</h2>
        <h3>{isLogin ? 'Login' : 'Register'}</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="patient">Patient</option>
                <option value="clinician">Clinician</option>
                <option value="admin">Administrator</option>
              </select>

              {formData.role === 'patient' && (
                <>
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="condition"
                    placeholder="Medical Condition"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Home Address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              {formData.role === 'clinician' && (
                <>
                  <input
                    type="text"
                    name="specialization"
                    placeholder="Specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="License Number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </>
              )}
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <>
              <p>
                Don't have an account?{' '}
                <span onClick={() => setIsLogin(false)}>Register here</span>
              </p>
              <p>
                <span onClick={onForgotPassword} style={{ color: '#e74c3c' }}>
                  Forgot Password?
                </span>
              </p>
            </>
          ) : (
            <p>
              Already have an account?{' '}
              <span onClick={() => setIsLogin(true)}>Login here</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;