// frontend/src/pages/AdminDashboard.js - COMPLETE UPDATED FILE
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://home-health-backend-gpbg.onrender.com/api';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [readings, setReadings] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [showLabForm, setShowLabForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientStatusFilter, setPatientStatusFilter] = useState('all');
  const [patientConditionFilter, setPatientConditionFilter] = useState('all');
  
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, emergenciesRes, paymentsRes, readingsRes, labsRes] = await Promise.all([
        axios.get(`${API_URL}/patients`, config),
        axios.get(`${API_URL}/emergencies`, config),
        axios.get(`${API_URL}/payments`, config),
        axios.get(`${API_URL}/readings`, config),
        axios.get(`${API_URL}/labs`, config)
      ]);
      setPatients(patientsRes.data);
      setEmergencies(emergenciesRes.data);
      setPayments(paymentsRes.data);
      setReadings(readingsRes.data);
      setLabResults(labsRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Helper functions for patient cards
  const getConditionColor = (condition) => {
    if (!condition) return 'default';
    const cond = condition.toLowerCase();
    if (cond.includes('diabetes')) return 'diabetes';
    if (cond.includes('hyperten')) return 'hypertension';
    if (cond.includes('heart')) return 'heart';
    if (cond.includes('critical')) return 'critical';
    return 'default';
  };

  const getConditionDistribution = () => {
    const conditions = {};
    patients.forEach(patient => {
      const cond = patient.condition || 'Unknown';
      conditions[cond] = (conditions[cond] || 0) + 1;
    });
    
    return Object.entries(conditions).map(([name, count]) => ({
      name,
      count,
      percentage: patients.length > 0 ? (count / patients.length) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  };

  const getLastReadingTime = (patientId) => {
    const patientReadings = readings.filter(r => r.patientId?._id === patientId);
    if (patientReadings.length === 0) return 'No readings';
    
    const lastReading = patientReadings.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
    
    const diff = Math.floor((new Date() - new Date(lastReading.createdAt)) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return 'Over a week ago';
  };

  // Filter patients for search
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patientSearch === '' || 
      patient.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.email?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.condition?.toLowerCase().includes(patientSearch.toLowerCase());
    
    const matchesStatus = patientStatusFilter === 'all' || 
      (patientStatusFilter === 'active' && patient.isActive) ||
      (patientStatusFilter === 'inactive' && !patient.isActive);
    
    const matchesCondition = patientConditionFilter === 'all' ||
      (patient.condition?.toLowerCase().includes(patientConditionFilter));
    
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const handleCreateLabResult = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await axios.post(`${API_URL}/labs`, {
        patientId: formData.get('patientId'),
        testType: formData.get('testType'),
        testName: formData.get('testName'),
        testDate: formData.get('testDate'),
        results: [
          {
            parameter: formData.get('parameter1'),
            value: formData.get('value1'),
            normalRange: formData.get('range1'),
            unit: formData.get('unit1'),
            flag: formData.get('flag1')
          }
        ],
        overallStatus: formData.get('overallStatus'),
        notes: formData.get('notes')
      }, config);
      
      alert('✅ Lab result added');
      setShowLabForm(false);
      e.target.reset();
      fetchData();
    } catch (error) {
      alert('Error creating lab result');
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await axios.post(`${API_URL}/payments`, {
        patientId: formData.get('patientId'),
        amount: parseFloat(formData.get('amount')),
        paymentType: formData.get('paymentType'),
        paymentMethod: formData.get('paymentMethod'),
        description: formData.get('description'),
        status: 'pending'
      }, config);
      
      alert('✅ Payment record created');
      setShowPaymentForm(false);
      e.target.reset();
      fetchData();
    } catch (error) {
      alert('Error creating payment');
    }
  };

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>👑 Administrator Dashboard</h2>
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
        <button className={activeTab === 'labs' ? 'active' : ''} onClick={() => setActiveTab('labs')}>Lab Results</button>
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
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="patients-section">
            <div className="section-header">
              <h3>👥 Patient Management ({patients.length})</h3>
              <div className="patients-actions">
                <button className="action-btn export-btn">📊 Export Data</button>
                <button className="action-btn add-btn">➕ Add Patient</button>
              </div>
            </div>

            <div className="patient-stats-grid">
              <div className="patient-stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-content">
                  <h4>Total Patients</h4>
                  <p className="stat-number">{patients.length}</p>
                </div>
              </div>
              <div className="patient-stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h4>Active Patients</h4>
                  <p className="stat-number">
                    {patients.filter(p => p.isActive).length}
                  </p>
                  <p className="stat-percentage">
                    {patients.length > 0 
                      ? ((patients.filter(p => p.isActive).length / patients.length) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
              <div className="patient-stat-card">
                <div className="stat-icon">🩺</div>
                <div className="stat-content">
                  <h4>Average Age</h4>
                  <p className="stat-number">
                    {patients.length > 0 
                      ? (patients.reduce((sum, p) => sum + p.age, 0) / patients.length).toFixed(1)
                      : 0}
                  </p>
                  <p className="stat-label">years</p>
                </div>
              </div>
              <div className="patient-stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <h4>Critical Patients</h4>
                  <p className="stat-number critical">
                    {patients.filter(p => p.condition?.toLowerCase().includes('critical')).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="patients-filter">
              <div className="search-container">
                <input 
                  type="text" 
                  placeholder="Search patients by name, condition, or email..."
                  className="search-input"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
                <button className="search-btn">🔍</button>
              </div>
              
              <div className="filter-options">
                <select 
                  className="filter-select"
                  value={patientStatusFilter}
                  onChange={(e) => setPatientStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                <select 
                  className="filter-select"
                  value={patientConditionFilter}
                  onChange={(e) => setPatientConditionFilter(e.target.value)}
                >
                  <option value="all">All Conditions</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="hypertension">Hypertension</option>
                  <option value="heart">Heart Disease</option>
                  <option value="respiratory">Respiratory</option>
                </select>
                
                <button className="sort-btn">Sort: Newest ⬇</button>
              </div>
            </div>

            <div className="patient-cards-grid">
              {filteredPatients.length === 0 ? (
                <div className="no-patients">
                  <div className="no-data-icon">👤</div>
                  <p>No patients found</p>
                  <button className="add-patient-btn">➕ Add First Patient</button>
                </div>
              ) : (
                filteredPatients.map(patient => (
                  <div key={patient._id} className={`patient-card ${patient.isActive ? 'active' : 'inactive'}`}>
                    <div className="patient-card-header">
                      <div className="patient-avatar">
                        <span className="avatar-text">{patient.name?.charAt(0) || 'P'}</span>
                      </div>
                      <div className="patient-info">
                        <h4 className="patient-name">{patient.name || 'Unknown Patient'}</h4>
                        <p className="patient-email">{patient.email || 'No email'}</p>
                        <div className="patient-meta">
                          <span className="patient-age">👤 {patient.age || '?'} years</span>
                          <span className={`patient-status ${patient.isActive ? 'active' : 'inactive'}`}>
                            {patient.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="patient-card-body">
                      <div className="patient-condition">
                        <h5>Condition</h5>
                        <p className={`condition-badge ${getConditionColor(patient.condition)}`}>
                          {patient.condition || 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="patient-stats">
                        <div className="stat-item">
                          <span className="stat-label">Readings</span>
                          <span className="stat-value">
                            {readings.filter(r => r.patientId?._id === patient._id).length}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Alerts</span>
                          <span className="stat-value alert-count">
                            {readings.filter(r => 
                              r.patientId?._id === patient._id && 
                              r.alertLevel === 'critical'
                            ).length}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Payments</span>
                          <span className="stat-value">
                            ${payments
                              .filter(p => p.patientId?._id === patient._id && p.status === 'completed')
                              .reduce((sum, p) => sum + p.amount, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="patient-details">
                        <div className="detail-item">
                          <span className="detail-label">📅 Joined:</span>
                          <span className="detail-value">
                            {patient.createdAt 
                              ? new Date(patient.createdAt).toLocaleDateString()
                              : 'Unknown'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">📍 Address:</span>
                          <span className="detail-value">
                            {patient.address || 'Not provided'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">📱 Phone:</span>
                          <span className="detail-value">
                            {patient.phone || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="patient-card-footer">
                      <div className="patient-actions">
                        <button className="action-btn view-btn" title="View Profile">
                          👁️ View
                        </button>
                        <button className="action-btn edit-btn" title="Edit Patient">
                          ✏️ Edit
                        </button>
                        <button className="action-btn message-btn" title="Send Message">
                          ✉️ Message
                        </button>
                        <button className="action-btn chart-btn" title="View Health Chart">
                          📈 Chart
                        </button>
                        <button className={`action-btn status-btn ${patient.isActive ? 'deactivate' : 'activate'}`}>
                          {patient.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                        </button>
                      </div>
                    </div>
                    
                    {patient.condition?.toLowerCase().includes('critical') && (
                      <div className="critical-banner">
                        ⚠️ Critical Condition - Requires Attention
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="patients-summary">
              <div className="summary-section">
                <h5>📊 Patient Distribution by Condition</h5>
                <div className="condition-distribution">
                  {getConditionDistribution().map(item => (
                    <div key={item.name} className="distribution-item">
                      <span className="condition-name">{item.name}</span>
                      <div className="distribution-bar">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="condition-count">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="summary-section">
                <h5>📈 Recent Patient Activity</h5>
                <div className="recent-activity">
                  {patients.slice(0, 3).map(patient => (
                    <div key={patient._id} className="activity-item">
                      <span className="activity-avatar">{patient.name?.charAt(0) || 'P'}</span>
                      <div className="activity-info">
                        <span className="activity-name">{patient.name}</span>
                        <span className="activity-time">
                          Last reading: {getLastReadingTime(patient._id)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergencies' && (
          <div className="emergencies-section">
            <h3>Emergency Reports ({emergencies.length})</h3>
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
            <div className="section-header">
              <h3>Payment Management</h3>
              <button onClick={() => setShowPaymentForm(!showPaymentForm)} className="add-btn">
                {showPaymentForm ? 'Cancel' : '+ Add Payment'}
              </button>
            </div>

            {showPaymentForm && (
              <form onSubmit={handleCreatePayment} className="form-section">
                <select name="patientId" required>
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>

                <select name="paymentType" required>
                  <option value="consultation">Consultation</option>
                  <option value="device_monitoring">Device Monitoring</option>
                  <option value="home_visit">Home Visit</option>
                  <option value="emergency_response">Emergency Response</option>
                  <option value="medication">Medication</option>
                  <option value="lab_test">Lab Test</option>
                  <option value="other">Other</option>
                </select>

                <input type="number" name="amount" placeholder="Amount ($)" step="0.01" required />

                <select name="paymentMethod" required>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>

                <textarea name="description" placeholder="Description" rows="2" />

                <button type="submit">Create Payment Record</button>
              </form>
            )}

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

        {activeTab === 'labs' && (
          <div className="labs-section">
            <div className="section-header">
              <h3>Lab Results Management</h3>
              <button onClick={() => setShowLabForm(!showLabForm)} className="add-btn">
                {showLabForm ? 'Cancel' : '+ Add Lab Result'}
              </button>
            </div>

            {showLabForm && (
              <form onSubmit={handleCreateLabResult} className="form-section">
                <select name="patientId" required>
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>

                <input name="testType" placeholder="Test Type (e.g., Blood Work)" required />
                <input name="testName" placeholder="Test Name (e.g., Complete Blood Count)" required />
                <input type="date" name="testDate" required />

                <h4>Test Results</h4>
                <input name="parameter1" placeholder="Parameter (e.g., White Blood Cells)" />
                <input name="value1" placeholder="Value (e.g., 7.5)" />
                <input name="unit1" placeholder="Unit (e.g., k/uL)" />
                <input name="range1" placeholder="Normal Range (e.g., 4.5-11.0)" />

                <select name="flag1">
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical</option>
                </select>

                <select name="overallStatus" required>
                  <option value="normal">Normal</option>
                  <option value="abnormal">Abnormal</option>
                  <option value="critical">Critical</option>
                </select>

                <textarea name="notes" placeholder="Additional Notes" rows="2" />

                <button type="submit">Add Lab Result</button>
              </form>
            )}

            <div className="labs-list">
              {labResults.map(lab => (
                <div key={lab._id} className={`lab-card ${lab.overallStatus}`}>
                  <h4>{lab.patientId?.name} - {lab.testName}</h4>
                  <p><strong>Type:</strong> {lab.testType}</p>
                  <p><strong>Date:</strong> {new Date(lab.testDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {lab.overallStatus}</p>
                </div>
              ))}
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
              <p>Active: {emergencies.filter(e => e.status === 'pending').length}</p>
            </div>

            <div className="report-card">
              <h4>Health Monitoring</h4>
              <p>Total Readings: {readings.length}</p>
              <p>Flagged Readings: {readings.filter(r => r.flagged).length}</p>
              <p>Flag Rate: {readings.length > 0 
                ? ((readings.filter(r => r.flagged).length / readings.length) * 100).toFixed(1)
                : 0}%</p>
            </div>

            <div className="report-card">
              <h4>Financial Summary</h4>
              <p>Total Revenue: ${totalRevenue.toFixed(2)}</p>
              <p>Pending Payments: {payments.filter(p => p.status === 'pending').length}</p>
              <p>Completed Transactions: {payments.filter(p => p.status === 'completed').length}</p>
            </div>

            <div className="report-card">
              <h4>Lab Results</h4>
              <p>Total Lab Tests: {labResults.length}</p>
              <p>Critical Results: {labResults.filter(l => l.overallStatus === 'critical').length}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;