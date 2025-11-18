import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataCard from '../components/DataCard';

const API_URL = 'http://localhost:5000/api';

function StaffDashboard() {
  const [patients, setPatients] = useState([]);
  const [readings, setReadings] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [patientsRes, readingsRes, emergenciesRes] = await Promise.all([
        axios.get(`${API_URL}/patients`),
        axios.get(`${API_URL}/readings`),
        axios.get(`${API_URL}/emergencies`)
      ]);
      setPatients(patientsRes.data);
      setReadings(readingsRes.data);
      setEmergencies(emergenciesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const resolveEmergency = async (emergencyId) => {
    try {
      const response = await axios.put(`${API_URL}/emergencies/${emergencyId}/resolve`);
      alert(`✅ ${response.data.message}`);
      await fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error resolving emergency:', error);
      alert('Error resolving emergency');
    }
  };

  const getActiveEmergencies = () => {
    return emergencies.filter(e => e.status === 'pending');
  };

  const getResolvedEmergencies = () => {
    return emergencies.filter(e => e.status === 'resolved');
  };

  return (
    <div className="staff-dashboard">
      <header className="dashboard-header">
        <h2>Staff Dashboard</h2>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{patients.length}</h3>
            <p>Total Patients</p>
          </div>
          <div className="stat-card">
            <h3>{readings.length}</h3>
            <p>Health Readings</p>
          </div>
          <div className="stat-card emergency-stat">
            <h3>{getActiveEmergencies().length}</h3>
            <p>Active Emergencies</p>
          </div>
          <div className="stat-card resolved-stat">
            <h3>{getResolvedEmergencies().length}</h3>
            <p>Resolved Emergencies</p>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeView === 'overview' ? 'active' : ''}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button 
          className={activeView === 'patients' ? 'active' : ''}
          onClick={() => setActiveView('patients')}
        >
          Patient Management
        </button>
        <button 
          className={activeView === 'emergencies' ? 'active' : ''}
          onClick={() => setActiveView('emergencies')}
        >
          Emergency Response
        </button>
        <button 
          className={activeView === 'data' ? 'active' : ''}
          onClick={() => setActiveView('data')}
        >
          All Data
        </button>
      </nav>

      <div className="dashboard-content">
        {activeView === 'overview' && (
          <div className="overview">
            <div className="overview-alerts">
              <h3>🚨 Active Emergency Alerts</h3>
              {getActiveEmergencies().length === 0 ? (
                <p className="no-alerts">No active emergencies 🟢 All clear!</p>
              ) : (
                getActiveEmergencies().map(emergency => (
                  <div key={emergency._id} className="alert-item active-alert">
                    <span className="alert-icon">🚨</span>
                    <div className="alert-details">
                      <strong>{emergency.patientName}</strong>
                      <span>Emergency triggered at {new Date(emergency.createdAt).toLocaleString()}</span>
                      <span className="urgent-text">URGENT RESPONSE NEEDED</span>
                    </div>
                    <button 
                      className="resolve-btn"
                      onClick={() => resolveEmergency(emergency._id)}
                    >
                      ✅ Mark Resolved
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="recent-activity">
              <h3>Recent Health Readings</h3>
              {readings.slice(0, 5).map(reading => (
                <div key={reading._id} className="activity-item">
                  <span className="activity-type">{reading.type}</span>
                  <span className="activity-value">{reading.value}</span>
                  <span className="activity-time">
                    {new Date(reading.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'patients' && (
          <DataCard title="Registered Patients" data={patients} type="patient" />
        )}

        {activeView === 'emergencies' && (
          <div className="emergencies-view">
            <div className="emergencies-section">
              <h3>Active Emergencies ({getActiveEmergencies().length})</h3>
              {getActiveEmergencies().length === 0 ? (
                <p className="no-data">No active emergencies</p>
              ) : (
                getActiveEmergencies().map(emergency => (
                  <div key={emergency._id} className="emergency-card active-emergency">
                    <div className="emergency-header">
                      <span className="emergency-status active">ACTIVE</span>
                      <span className="emergency-time">
                        {new Date(emergency.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4>Patient: {emergency.patientName}</h4>
                    <p>{emergency.message}</p>
                    <button 
                      className="resolve-btn full-width"
                      onClick={() => resolveEmergency(emergency._id)}
                    >
                      ✅ Mark as Resolved & Dispatch Help
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="emergencies-section">
              <h3>Resolved Emergencies ({getResolvedEmergencies().length})</h3>
              {getResolvedEmergencies().length === 0 ? (
                <p className="no-data">No resolved emergencies</p>
              ) : (
                getResolvedEmergencies().map(emergency => (
                  <div key={emergency._id} className="emergency-card resolved-emergency">
                    <div className="emergency-header">
                      <span className="emergency-status resolved">RESOLVED</span>
                      <span className="emergency-time">
                        Resolved: {new Date(emergency.resolvedAt).toLocaleString()}
                      </span>
                    </div>
                    <h4>Patient: {emergency.patientName}</h4>
                    <p>{emergency.message}</p>
                    <p className="resolved-note">✅ Emergency handled and resolved</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeView === 'data' && (
          <div className="data-section">
            <DataCard title="Patients" data={patients} type="patient" />
            <DataCard title="Health Readings" data={readings} type="reading" />
            <DataCard title="All Emergencies" data={emergencies} type="emergency" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffDashboard;