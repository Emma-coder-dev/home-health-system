// frontend/src/pages/PatientDashboard.js - UPDATED WITH LAB RESULTS
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

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [readingsRes, appointmentsRes, emrRes, carePlansRes, labsRes] = await Promise.all([
        axios.get(`${API_URL}/readings`, config),
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
      console.error('Error:', error);
    }
  };

  const submitVitals = async (type) => {
    let value = '';
    switch (type) {
      case 'blood_pressure':
        value = `${Math.floor(Math.random() * 40) + 100}/${Math.floor(Math.random() * 25) + 70}`;
        break;
      case 'heart_rate':
        value = `${Math.floor(Math.random() * 60) + 50} bpm`;
        break;
      case 'glucose':
        value = `${Math.floor(Math.random() * 100) + 70} mg/dL`;
        break;
    }

    try {
      await axios.post(`${API_URL}/readings`, { type, value, automated: true }, config);
      alert(`âœ… ${type.replace('_', ' ')} reading: ${value}`);
      fetchData();
    } catch (error) {
      alert('Error submitting reading');
    }
  };

  const triggerEmergency = async () => {
    if (!window.confirm('ðŸš¨ Trigger emergency?')) return;
    try {
      await axios.post(`${API_URL}/emergencies`, {
        emergencyType: 'lifeline_button',
        message: 'Patient triggered emergency!'
      }, config);
      alert('ðŸ†˜ EMERGENCY SENT!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>ðŸ‘¤ Patient Dashboard</h2>
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
        <button className={activeTab === 'records' ? 'active' : ''} onClick={() => setActiveTab('records')}>Records</button>
        <button className={activeTab === 'careplan' ? 'active' : ''} onClick={() => setActiveTab('careplan')}>Care Plan</button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card"><h3>{readings.length}</h3><p>Total Readings</p></div>
              <div className="stat-card"><h3>{appointments.filter(a => a.status === 'scheduled').length}</h3><p>Appointments</p></div>
              <div className="stat-card"><h3>{labResults.length}</h3><p>Lab Results</p></div>
            </div>

            <div className="emergency-section">
              <h3>ðŸ†˜ Emergency</h3>
              <button className="emergency-btn" onClick={triggerEmergency}>ðŸš¨ LIFELINE BUTTON</button>
            </div>

            <div className="recent-activity">
              <h3>Recent Readings</h3>
              {readings.slice(0, 5).map(r => (
                <div key={r._id} className="activity-item">
                  <span>{r.type}</span>
                  <span>{r.value}</span>
                  <span className={`alert-level ${r.alertLevel}`}>{r.alertLevel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="vitals-section">
            <h3>Submit Health Readings</h3>
            <div className="device-buttons">
              <button onClick={() => submitVitals('blood_pressure')}>ðŸ©º Blood Pressure</button>
              <button onClick={() => submitVitals('heart_rate')}>â Heart 
Rate</button>
              <button onClick={() => submitVitals('glucose')}>ðŸ©¸ Glucose</button>
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
          <div className="records-section">
            <h3>Medical Records</h3>
            {emrRecords.length === 0 ? (
              <p className="no-data">No records available</p>
            ) : (
              emrRecords.map(r => (
                <div key={r._id} className="record-card">
                  <h4>{r.title}</h4>
                  <p className="record-type">{r.recordType}</p>
                  <p>{r.description}</p>
                  <p className="record-date">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
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
      </main>
    </div>
  );
}

export default PatientDashboard;