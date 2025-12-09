// frontend/src/pages/PatientDashboard.js - COMPLETE UPDATED FILE
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://home-health-backend-gpbg.onrender.com/api';

function PatientDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [readings, setReadings] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [emrRecords, setEmrRecords] = useState([]);
  const [carePlans, setCarePlans] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recordFilter, setRecordFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [readingsRes, appointmentsRes, emrRes, carePlansRes, labsRes] = await Promise.all([
        axios.get(`${API_URL}/readings?sort=recent&limit=10`, config),
        axios.get(`${API_URL}/appointments`, config),
        axios.get(`${API_URL}/emr`, config),
        axios.get(`${API_URL}/care-plans`, config),
        axios.get(`${API_URL}/labs`, config)
      ]);
      setReadings(readingsRes.data);
      setAppointments(appointmentsRes.data);
      setEmrRecords(emrRes.data);
      setCarePlans(carePlansRes.data);
      setLabResults(labsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter records for medical records section
  const filteredRecords = emrRecords.filter(record => {
    const matchesFilter = recordFilter === 'all' || record.recordType === recordFilter;
    const matchesSearch = searchTerm === '' || 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group readings by date
  const groupReadingsByDate = () => {
    const grouped = {};
    readings.forEach(reading => {
      const date = new Date(reading.createdAt).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(reading);
    });
    return grouped;
  };

  // Get reading trends
  const getReadingTrends = (type) => {
    const typeReadings = readings
      .filter(r => r.type === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    if (typeReadings.length < 2) return 'insufficient';
    
    const values = typeReadings.map(r => {
      const num = parseFloat(r.value.match(/\d+/g)?.[0]);
      return isNaN(num) ? 0 : num;
    });
    
    const diff = values[0] - values[values.length - 1];
    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  };

  // Calculate health score
  const calculateHealthScore = () => {
    if (readings.length === 0) return 85;
    
    let score = 100;
    const recentCritical = readings
      .slice(0, 5)
      .filter(r => r.alertLevel === 'critical').length;
    
    const recentWarning = readings
      .slice(0, 5)
      .filter(r => r.alertLevel === 'warning').length;
    
    score -= (recentCritical * 10);
    score -= (recentWarning * 5);
    
    return Math.max(50, Math.min(100, score));
  };

  // Get icon for reading type
  const getReadingIcon = (type) => {
    const icons = {
      'blood_pressure': '💓',
      'heart_rate': '❤️',
      'glucose': '🩸',
      'temperature': '🌡️',
      'weight': '⚖️',
      'oxygen_saturation': '💨'
    };
    return icons[type] || '📊';
  };

  // Get icon for record type
  const getRecordIcon = (recordType) => {
    const icons = {
      'diagnosis': '🩺',
      'prescription': '💊',
      'lab_result': '🧪',
      'vital_record': '❤️',
      'visit_summary': '📋',
      'other': '📄'
    };
    return icons[recordType] || '📄';
  };

  // Format reading value with unit
  const formatReadingValue = (reading) => {
    if (reading.type === 'blood_pressure') return reading.value;
    return `${reading.value}${reading.unit ? ` ${reading.unit}` : ''}`;
  };

  const submitVitals = async (type) => {
    let value = '';
    let unit = '';
    
    switch (type) {
      case 'blood_pressure':
        value = `${Math.floor(Math.random() * 40) + 100}/${Math.floor(Math.random() * 25) + 70}`;
        unit = 'mmHg';
        break;
      case 'heart_rate':
        value = `${Math.floor(Math.random() * 60) + 50}`;
        unit = 'bpm';
        break;
      case 'glucose':
        value = `${Math.floor(Math.random() * 100) + 70}`;
        unit = 'mg/dL';
        break;
      case 'temperature':
        value = `${(Math.random() * 2 + 36.5).toFixed(1)}`;
        unit = '°C';
        break;
      case 'oxygen_saturation':
        value = `${Math.floor(Math.random() * 10) + 92}`;
        unit = '%';
        break;
      case 'weight':
        value = `${Math.floor(Math.random() * 30) + 60}`;
        unit = 'kg';
        break;
    }

    try {
      await axios.post(`${API_URL}/readings`, { type, value, unit, automated: true }, config);
      fetchData();
    } catch (error) {
      alert('Error submitting reading');
    }
  };

  const triggerEmergency = async () => {
    if (!window.confirm('🚨 Trigger emergency?')) return;
    try {
      await axios.post(`${API_URL}/emergencies`, {
        emergencyType: 'lifeline_button',
        message: 'Patient triggered emergency!'
      }, config);
      alert('🚑 EMERGENCY SENT!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>👤 Patient Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'vitals' ? 'active' : ''} onClick={() => setActiveTab('vitals')}>My Vitals</button>
        <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>Appointments</button>
        <button className={activeTab === 'labs' ? 'active' : ''} onClick={() => setActiveTab('labs')}>Lab Results</button>
        <button className={activeTab === 'records' ? 'active' : ''} onClick={() => setActiveTab('records')}>Medical Records</button>
        <button className={activeTab === 'careplan' ? 'active' : ''} onClick={() => setActiveTab('careplan')}>Care Plan</button>
      </nav>

      <main className="dashboard-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="health-summary">
                  <div className="health-score">
                    <h3>Health Score</h3>
                    <div className="score-circle" style={{ '--score': calculateHealthScore() }}>
                      {calculateHealthScore()}
                    </div>
                    <p>Based on recent readings</p>
                  </div>
                  
                  <div className="quick-stats">
                    <div className="stat-card">
                      <h4>📊 Total Readings</h4>
                      <p>{readings.length}</p>
                    </div>
                    <div className="stat-card">
                      <h4>📅 Appointments</h4>
                      <p>{appointments.filter(a => a.status === 'scheduled').length}</p>
                    </div>
                    <div className="stat-card">
                      <h4>🧪 Lab Results</h4>
                      <p>{labResults.length}</p>
                    </div>
                    <div className="stat-card">
                      <h4>⚠️ Alerts</h4>
                      <p className="alert-count">
                        {readings.filter(r => r.alertLevel === 'critical').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="emergency-section">
                  <h3>🚑 Emergency</h3>
                  <p>Press this button in case of emergency</p>
                  <button className="emergency-btn" onClick={triggerEmergency}>
                    🚨 LIFELINE BUTTON
                  </button>
                </div>

                <div className="recent-readings-section">
                  <div className="section-header">
                    <h3>📈 Recent Health Readings</h3>
                    <button className="refresh-btn" onClick={fetchData}>⟳ Refresh</button>
                  </div>

                  <div className="trends-grid">
                    {['blood_pressure', 'heart_rate', 'glucose'].map(type => (
                      <div key={type} className="trend-card">
                        <div className="trend-header">
                          <span className="trend-icon">{getReadingIcon(type)}</span>
                          <span className="trend-name">{type.replace('_', ' ')}</span>
                        </div>
                        <div className={`trend-status ${getReadingTrends(type)}`}>
                          {getReadingTrends(type)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="readings-by-date">
                    {Object.entries(groupReadingsByDate()).slice(0, 3).map(([date, dateReadings]) => (
                      <div key={date} className="date-group">
                        <h4>{date}</h4>
                        <div className="date-readings">
                          {dateReadings.map(reading => (
                            <div key={reading._id} className={`reading-item ${reading.alertLevel}`}>
                              <div className="reading-icon-type">
                                <span className="reading-icon">{getReadingIcon(reading.type)}</span>
                                <span className="reading-type">{reading.type.replace('_', ' ')}</span>
                              </div>
                              <div className="reading-value-time">
                                <span className="reading-value">{formatReadingValue(reading)}</span>
                                <span className="reading-time">
                                  {new Date(reading.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {reading.alertLevel !== 'normal' && (
                                <div className={`alert-indicator ${reading.alertLevel}`}>
                                  {reading.alertLevel}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="quick-submit">
                    <h4>Submit New Reading</h4>
                    <div className="submit-buttons">
                      <button onClick={() => submitVitals('blood_pressure')} className="submit-btn bp">
                        💓 BP
                      </button>
                      <button onClick={() => submitVitals('heart_rate')} className="submit-btn hr">
                        ❤️ HR
                      </button>
                      <button onClick={() => submitVitals('glucose')} className="submit-btn glucose">
                        🩸 Glucose
                      </button>
                      <button onClick={() => submitVitals('temperature')} className="submit-btn temp">
                        🌡️ Temp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="vitals-section">
                <h3>Submit Health Readings</h3>
                <div className="device-buttons">
                  <button onClick={() => submitVitals('blood_pressure')}>💓 Blood Pressure</button>
                  <button onClick={() => submitVitals('heart_rate')}>❤️ Heart Rate</button>
                  <button onClick={() => submitVitals('glucose')}>🩸 Glucose</button>
                </div>

                <h4>Recent Readings</h4>
                {readings.map(r => (
                  <div key={r._id} className={`reading-card ${r.alertLevel}`}>
                    <div className="reading-header">
                      <span>{r.type}</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="reading-value">{r.value}</div>
                    {r.alertLevel !== 'normal' && <div className="alert-badge">{r.alertLevel}</div>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="appointments-section">
                <h3>Appointments</h3>
                {appointments.length === 0 ? (
                  <p className="no-data">No appointments scheduled</p>
                ) : (
                  appointments.map(apt => (
                    <div key={apt._id} className={`appointment-card ${apt.status}`}>
                      <h4>{apt.appointmentType.replace('_', ' ')}</h4>
                      <p><strong>Date:</strong> {new Date(apt.scheduledDate).toLocaleString()}</p>
                      <p><strong>Clinician:</strong> {apt.clinicianId?.name}</p>
                      <p><strong>Status:</strong> {apt.status}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'labs' && (
              <div className="labs-section">
                <h3>My Lab Results</h3>
                {labResults.length === 0 ? (
                  <p className="no-data">No lab results available</p>
                ) : (
                  labResults.map(lab => (
                    <div key={lab._id} className={`lab-card ${lab.overallStatus}`}>
                      <div className="lab-header">
                        <h4>{lab.testName}</h4>
                        <span className={`status-badge ${lab.overallStatus}`}>{lab.overallStatus}</span>
                      </div>
                      <p><strong>Test Type:</strong> {lab.testType}</p>
                      <p><strong>Test Date:</strong> {new Date(lab.testDate).toLocaleDateString()}</p>
                      <p><strong>Result Date:</strong> {new Date(lab.resultDate).toLocaleDateString()}</p>

                      {lab.results && lab.results.length > 0 && (
                        <div className="lab-results-detail">
                          <h5>Results:</h5>
                          {lab.results.map((result, idx) => (
                            <div key={idx} className="result-item">
                              <span><strong>{result.parameter}:</strong></span>
                              <span>{result.value} {result.unit}</span>
                              <span className={`flag ${result.flag}`}>{result.flag}</span>
                              {result.normalRange && <span className="range">Normal: {result.normalRange}</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {lab.notes && (
                        <div className="lab-notes">
                          <strong>Notes:</strong> {lab.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'records' && (
              <div className="medical-records-section">
                <div className="section-header">
                  <h3>📋 My Medical Records</h3>
                  <div className="record-stats">
                    <span className="stat-badge">{emrRecords.length} Records</span>
                    <span className="stat-badge">
                      {emrRecords.filter(r => r.recordType === 'diagnosis').length} Diagnoses
                    </span>
                    <span className="stat-badge">
                      {emrRecords.filter(r => r.recordType === 'prescription').length} Prescriptions
                    </span>
                  </div>
                </div>

                <div className="records-filter">
                  <div className="filter-tabs">
                    <button 
                      className={`filter-tab ${recordFilter === 'all' ? 'active' : ''}`} 
                      onClick={() => setRecordFilter('all')}
                    >
                      All Records
                    </button>
                    <button 
                      className={`filter-tab ${recordFilter === 'diagnosis' ? 'active' : ''}`} 
                      onClick={() => setRecordFilter('diagnosis')}
                    >
                      Diagnoses
                    </button>
                    <button 
                      className={`filter-tab ${recordFilter === 'prescription' ? 'active' : ''}`} 
                      onClick={() => setRecordFilter('prescription')}
                    >
                      Prescriptions
                    </button>
                    <button 
                      className={`filter-tab ${recordFilter === 'lab_result' ? 'active' : ''}`} 
                      onClick={() => setRecordFilter('lab_result')}
                    >
                      Lab Results
                    </button>
                    <button 
                      className={`filter-tab ${recordFilter === 'visit_summary' ? 'active' : ''}`} 
                      onClick={() => setRecordFilter('visit_summary')}
                    >
                      Visit Summaries
                    </button>
                  </div>
                  
                  <div className="search-box">
                    <input 
                      type="text" 
                      placeholder="Search records..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    🔍
                  </div>
                </div>

                <div className="records-timeline">
                  {filteredRecords.length === 0 ? (
                    <div className="no-records">
                      <div className="no-data-icon">📋</div>
                      <p>No medical records found</p>
                      {recordFilter !== 'all' && (
                        <p>Try changing your filter or search term</p>
                      )}
                    </div>
                  ) : (
                    filteredRecords.map(record => (
                      <div key={record._id} className="timeline-item">
                        <div className="timeline-date">
                          <div className="timeline-day">
                            {new Date(record.createdAt).getDate()}
                          </div>
                          <div className="timeline-month">
                            {new Date(record.createdAt).toLocaleString('default', { month: 'short' })}
                          </div>
                          <div className="timeline-year">
                            {new Date(record.createdAt).getFullYear()}
                          </div>
                        </div>
                        
                        <div className={`record-card ${record.recordType} ${record.isConfidential ? 'confidential' : ''}`}>
                          <div className="record-header">
                            <div className="record-type-icon">
                              {getRecordIcon(record.recordType)}
                            </div>
                            <div className="record-title-section">
                              <h4>{record.title}</h4>
                              <span className="record-type-badge">{record.recordType.replace('_', ' ')}</span>
                              {record.isConfidential && (
                                <span className="confidential-badge">🔒 Confidential</span>
                              )}
                            </div>
                            <div className="record-meta">
                              <span className="record-date">
                                {new Date(record.createdAt).toLocaleDateString()}
                              </span>
                              <span className="record-doctor">
                                By: {record.addedBy?.name || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="record-content">
                            <p className="record-description">{record.description}</p>
                            
                            {record.recordType === 'diagnosis' && record.diagnosis && (
                              <div className="diagnosis-details">
                                <h5>Diagnosis:</h5>
                                <p>{record.diagnosis}</p>
                              </div>
                            )}
                            
                            {record.recordType === 'prescription' && record.medications && record.medications.length > 0 && (
                              <div className="medication-details">
                                <h5>💊 Medications:</h5>
                                {record.medications.map((med, index) => (
                                  <div key={index} className="medication-item">
                                    <strong>{med.name}</strong>
                                    <span>Dosage: {med.dosage}</span>
                                    <span>Frequency: {med.frequency}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {record.recordType === 'vital_record' && record.vitalSigns && (
                              <div className="vitals-details">
                                <h5>🩺 Vital Signs:</h5>
                                <div className="vitals-grid">
                                  {record.vitalSigns.bloodPressure && (
                                    <div className="vital-item">
                                      <span>BP:</span>
                                      <strong>{record.vitalSigns.bloodPressure}</strong>
                                    </div>
                                  )}
                                  {record.vitalSigns.heartRate && (
                                    <div className="vital-item">
                                      <span>HR:</span>
                                      <strong>{record.vitalSigns.heartRate}</strong>
                                    </div>
                                  )}
                                  {record.vitalSigns.temperature && (
                                    <div className="vital-item">
                                      <span>Temp:</span>
                                      <strong>{record.vitalSigns.temperature}</strong>
                                    </div>
                                  )}
                                  {record.vitalSigns.oxygenSaturation && (
                                    <div className="vital-item">
                                      <span>SpO₂:</span>
                                      <strong>{record.vitalSigns.oxygenSaturation}</strong>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {record.attachments && record.attachments.length > 0 && (
                              <div className="attachments-section">
                                <h5>📎 Attachments:</h5>
                                <div className="attachments-list">
                                  {record.attachments.map((file, index) => (
                                    <a 
                                      key={index} 
                                      href={file.fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="attachment-item"
                                    >
                                      <span className="file-icon">📄</span>
                                      <span className="file-name">{file.fileName}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="record-footer">
                            <div className="record-actions">
                              <button className="action-btn view-btn">👁️ View Details</button>
                              <button className="action-btn download-btn">⬇️ Download</button>
                              {record.addedBy && (
                                <button className="action-btn contact-btn">✉️ Contact Provider</button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="records-summary">
                  <div className="summary-card">
                    <h5>📊 Records Summary</h5>
                    <div className="summary-stats">
                      <div className="summary-item">
                        <span className="summary-label">Total Records:</span>
                        <span className="summary-value">{emrRecords.length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Last Updated:</span>
                        <span className="summary-value">
                          {emrRecords.length > 0 
                            ? new Date(emrRecords[0].createdAt).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Confidential:</span>
                        <span className="summary-value">
                          {emrRecords.filter(r => r.isConfidential).length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="summary-card">
                    <h5>📅 Recent Activity</h5>
                    <div className="recent-activity-list">
                      {emrRecords.slice(0, 3).map(record => (
                        <div key={record._id} className="activity-item">
                          <span className="activity-icon">{getRecordIcon(record.recordType)}</span>
                          <div className="activity-details">
                            <span className="activity-title">{record.title}</span>
                            <span className="activity-date">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'careplan' && (
              <div className="careplan-section">
                <h3>Care Plan</h3>
                {carePlans.length === 0 ? (
                  <p className="no-data">No care plan available</p>
                ) : (
                  carePlans.map(plan => (
                    <div key={plan._id} className="careplan-card">
                      <h4>{plan.title}</h4>
                      <p><strong>Diagnosis:</strong> {plan.diagnosis}</p>
                      {plan.goals && plan.goals.length > 0 && (
                        <div className="goals-section">
                          <h5>Goals:</h5>
                          {plan.goals.map((g, i) => (
                            <div key={i} className="goal-item">
                              <span className={`status ${g.status}`}>{g.status}</span>
                              <span>{g.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default PatientDashboard;