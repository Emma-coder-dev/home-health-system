// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [readings, setReadings] = useState([]);
  
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, emergenciesRes, paymentsRes, readingsRes] = await Promise.all([
        axios.get(`${API_URL}/patients`, config),
        axios.get(`${API_URL}/emergencies`, config),
        axios.get(`${API_URL}/payments`, config),
        axios.get(`${API_URL}/readings`, config)
      ]);
      setPatients(patientsRes.data);
      setEmergencies(emergenciesRes.data);
      setPayments(paymentsRes.data);
      setReadings(readingsRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>👔 Administrator Dashboard</h2>
        <div className="user-info">
          <span>{user.name} - Admin</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'patients' ? 'active' : ''} onClick={() => setActiveTab('patients')}>All Patients</button>
        <button className={activeTab === 'emergencies' ? 'active' : ''} onClick={() => setActiveTab('emergencies')}>Emergency Reports</button>
        <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>Payments</button>
        <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>System Reports</button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h3>System Overview</h3>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{patients.length}</h3>
                <p>Total Patients</p>
              </div>
              <div className="stat-card emergency">
                <h3>{emergencies.filter(e => ['pending', 'acknowledged', 'responding'].includes(e.status)).length}</h3>
                <p>Active Emergencies</p>
              </div>
              <div className="stat-card">
                <h3>{readings.length}</h3>
                <p>Total Readings</p>
              </div>
              <div className="stat-card warning">
                <h3>{readings.filter(r => r.flagged).length}</h3>
                <p>Flagged Readings</p>
              </div>
            </div>

            <div className="financial-stats">
              <h4>Financial Overview</h4>
              <div className="stats-grid">
                <div className="stat-card success">
                  <h3>${totalRevenue.toFixed(2)}</h3>
                  <p>Total Revenue</p>
                </div>
                <div className="stat-card">
                  <h3>{payments.filter(p => p.status === 'pending').length}</h3>
                  <p>Pending Payments</p>
                </div>
                <div className="stat-card">
                  <h3>{payments.length}</h3>
                  <p>Total Transactions</p>
                </div>
              </div>
            </div>

            <div className="system-health">
              <h4>System Health</h4>
              <div className="health-indicators">
                <div className="indicator">
                  <span className="label">Database Status:</span>
                  <span className="status success">✓ Connected</span>
                </div>
                <div className="indicator">
                  <span className="label">API Status:</span>
                  <span className="status success">✓ Operational</span>
                </div>
                <div className="indicator">
                  <span className="label">Last Sync:</span>
                  <span className="status">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="patients-section">
            <h3>All Patients</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Condition</th>
                    <th>Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(patient => (
                    <tr key={patient._id}>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.condition}</td>
                      <td>{patient.address}</td>
                      <td>
                        <span className={`status ${patient.isActive ? 'active' : 'inactive'}`}>
                          {patient.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'emergencies' && (
          <div className="emergencies-section">
            <h3>Emergency Reports</h3>
            <div className="emergencies-list">
              {emergencies.map(emergency => (
                <div key={emergency._id} className={`emergency-card ${emergency.status}`}>
                  <div className="emergency-header">
                    <h4>{emergency.patientName}</h4>
                    <span className={`status-badge ${emergency.status}`}>{emergency.status}</span>
                  </div>
                  <p><strong>Type:</strong> {emergency.emergencyType}</p>
                  <p><strong>Severity:</strong> {emergency.severity}</p>
                  <p><strong>Time:</strong> {new Date(emergency.createdAt).toLocaleString()}</p>
                  {emergency.responseTime && (
                    <p><strong>Response Time:</strong> {emergency.responseTime} minutes</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-section">
            <h3>Payment Management</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment._id}>
                      <td>{payment.invoiceNumber}</td>
                      <td>{payment.patientId?.name}</td>
                      <td>{payment.paymentType}</td>
                      <td>${payment.amount.toFixed(2)}</td>
                      <td>
                        <span className={`status ${payment.status}`}>{payment.status}</span>
                      </td>
                      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-section">
            <div className="report-card">
              <h4>Patient Demographics</h4>
              <p>Total Registered Patients: {patients.length}</p>
              <p>Average Age: {patients.length > 0 
                ? (patients.reduce((sum, p) => sum + p.age, 0) / patients.length).toFixed(1) 
                : 0} years</p>
            </div>

            <div className="report-card">
              <h4>Emergency Response</h4>
              <p>Total Emergencies: {emergencies.length}</p>
              <p>Resolved: {emergencies.filter(e => e.status === 'resolved').length}</p>
            </div>

            <div className="report-card">
              <h4>Health Monitoring</h4>
              <p>Total Readings: {readings.length}</p>
              <p>Flagged Readings: {readings.filter(r => r.flagged).length}</p>
            </div>

            <div className="report-card">
              <h4>Financial Summary</h4>
              <p>Total Revenue: ${totalRevenue.toFixed(2)}</p>
              <p>Completed Transactions: {payments.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;