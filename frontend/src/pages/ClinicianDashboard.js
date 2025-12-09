// frontend/src/pages/ClinicianDashboard.js - WITH FORMS
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

function ClinicianDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [readings, setReadings] = useState([]);
  const [visitNotes, setVisitNotes] = useState([]);
  const [carePlans, setCarePlans] = useState([]);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showCarePlanForm, setShowCarePlanForm] = useState(false);
  
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, emergenciesRes, tasksRes, readingsRes, visitNotesRes, carePlansRes] = await Promise.all([
        axios.get(`${API_URL}/patients`, config),
        axios.get(`${API_URL}/emergencies`, config),
        axios.get(`${API_URL}/tasks`, config),
        axios.get(`${API_URL}/readings?flagged=true`, config),
        axios.get(`${API_URL}/visit-notes`, config),
        axios.get(`${API_URL}/care-plans`, config)
      ]);
      setPatients(patientsRes.data);
      setEmergencies(emergenciesRes.data);
      setTasks(tasksRes.data);
      setReadings(readingsRes.data);
      setVisitNotes(visitNotesRes.data);
      setCarePlans(carePlansRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resolveEmergency = async (id) => {
    try {
      await axios.put(`${API_URL}/emergencies/${id}/resolve`, {
        resolutionNotes: 'Emergency resolved',
        actionsTaken: 'Provided care'
      }, config);
      alert('✅ Resolved');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const completeTask = async (id) => {
    try {
      await axios.put(`${API_URL}/tasks/${id}/status`, {
        status: 'completed'
      }, config);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreateVisitNote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await axios.post(`${API_URL}/visit-notes`, {
        patientId: formData.get('patientId'),
        visitType: formData.get('visitType'),
        chiefComplaint: formData.get('chiefComplaint'),
        assessment: formData.get('assessment'),
        recommendations: formData.get('recommendations'),
        vitalSigns: {
          bloodPressure: formData.get('bloodPressure'),
          heartRate: formData.get('heartRate'),
          temperature: formData.get('temperature')
        }
      }, config);
      
      alert('✅ Visit note created');
      setShowVisitForm(false);
      fetchData();
    } catch (error) {
      alert('Error creating visit note');
    }
  };

  const handleCreateCarePlan = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await axios.post(`${API_URL}/care-plans`, {
        patientId: formData.get('patientId'),
        title: formData.get('title'),
        diagnosis: formData.get('diagnosis'),
        goals: [
          { description: formData.get('goal1'), status: 'not_started' }
        ],
        interventions: [
          { description: formData.get('intervention1'), frequency: formData.get('frequency1') }
        ]
      }, config);
      
      alert('✅ Care plan created');
      setShowCarePlanForm(false);
      fetchData();
    } catch (error) {
      alert('Error creating care plan');
    }
  };

  const activeEmergencies = emergencies.filter(e => ['pending', 'acknowledged'].includes(e.status));

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>👨‍⚕️ Clinician Dashboard</h2>
        <div className="user-info">
          <span>{user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'emergencies' ? 'active' : ''} onClick={() => setActiveTab('emergencies')}>Emergencies ({activeEmergencies.length})</button>
        <button className={activeTab === 'patients' ? 'active' : ''} onClick={() => setActiveTab('patients')}>Patients</button>
        <button className={activeTab === 'visitnotes' ? 'active' : ''} onClick={() => setActiveTab('visitnotes')}>Visit Notes</button>
        <button className={activeTab === 'careplans' ? 'active' : ''} onClick={() => setActiveTab('careplans')}>Care Plans</button>
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>Tasks</button>
        <button className={activeTab === 'readings' ? 'active' : ''} onClick={() => setActiveTab('readings')}>Flagged Readings</button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card emergency"><h3>{activeEmergencies.length}</h3><p>Active Emergencies</p></div>
              <div className="stat-card"><h3>{patients.length}</h3><p>Patients</p></div>
              <div className="stat-card"><h3>{tasks.filter(t => t.status === 'pending').length}</h3><p>Pending Tasks</p></div>
            </div>

            {activeEmergencies.length > 0 && (
              <div className="urgent-alerts">
                <h3>🚨 Active Emergencies</h3>
                {activeEmergencies.map(e => (
                  <div key={e._id} className="emergency-alert">
                    <strong>{e.patientName}</strong>
                    <p>{e.message}</p>
                    <button onClick={() => resolveEmergency(e._id)}>Resolve</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'emergencies' && (
          <div className="emergencies-section">
            <h3>Emergency Management</h3>
            {emergencies.map(e => (
              <div key={e._id} className={`emergency-card ${e.status}`}>
                <h4>{e.patientName}</h4>
                <p><strong>Type:</strong> {e.emergencyType}</p>
                <p><strong>Time:</strong> {new Date(e.createdAt).toLocaleString()}</p>
                {['pending', 'acknowledged'].includes(e.status) && (
                  <button onClick={() => resolveEmergency(e._id)}>Resolve</button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="patients-section">
            <h3>My Patients</h3>
            <div className="patients-grid">
              {patients.map(p => (
                <div key={p._id} className="patient-card">
                  <h4>{p.name}</h4>
                  <p><strong>Age:</strong> {p.age}</p>
                  <p><strong>Condition:</strong> {p.condition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'visitnotes' && (
          <div className="visitnotes-section">
            <div className="section-header">
              <h3>Visit Notes</h3>
              <button onClick={() => setShowVisitForm(!showVisitForm)} className="add-btn">
                {showVisitForm ? 'Cancel' : '+ New Visit Note'}
              </button>
            </div>

            {showVisitForm && (
              <form onSubmit={handleCreateVisitNote} className="form-section">
                <select name="patientId" required>
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p.userId}>{p.name}</option>
                  ))}
                </select>
                
                <select name="visitType" required>
                  <option value="routine_checkup">Routine Checkup</option>
                  <option value="device_inspection">Device Inspection</option>
                  <option value="emergency_response">Emergency Response</option>
                  <option value="follow_up">Follow Up</option>
                </select>

                <input name="chiefComplaint" placeholder="Chief Complaint" required />
                <textarea name="assessment" placeholder="Assessment" rows="3" required />
                <textarea name="recommendations" placeholder="Recommendations" rows="3" />
                
                <h4>Vital Signs</h4>
                <input name="bloodPressure" placeholder="Blood Pressure (e.g., 120/80)" />
                <input name="heartRate" placeholder="Heart Rate (e.g., 72 bpm)" />
                <input name="temperature" placeholder="Temperature (e.g., 98.6°F)" />

                <button type="submit">Create Visit Note</button>
              </form>
            )}

            <div className="visitnotes-list">
              {visitNotes.map(note => (
                <div key={note._id} className="visit-card">
                  <h4>{note.patientId?.name}</h4>
                  <p><strong>Type:</strong> {note.visitType}</p>
                  <p><strong>Date:</strong> {new Date(note.visitDate).toLocaleDateString()}</p>
                  <p><strong>Assessment:</strong> {note.assessment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'careplans' && (
          <div className="careplans-section">
            <div className="section-header">
              <h3>Care Plans</h3>
              <button onClick={() => setShowCarePlanForm(!showCarePlanForm)} className="add-btn">
                {showCarePlanForm ? 'Cancel' : '+ New Care Plan'}
              </button>
            </div>

            {showCarePlanForm && (
              <form onSubmit={handleCreateCarePlan} className="form-section">
                <select name="patientId" required>
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p.userId}>{p.name}</option>
                  ))}
                </select>

                <input name="title" placeholder="Care Plan Title" required />
                <input name="diagnosis" placeholder="Diagnosis" required />
                
                <h4>Goals</h4>
                <input name="goal1" placeholder="Goal 1" />
                
                <h4>Interventions</h4>
                <input name="intervention1" placeholder="Intervention 1" />
                <input name="frequency1" placeholder="Frequency (e.g., Daily)" />

                <button type="submit">Create Care Plan</button>
              </form>
            )}

            <div className="careplans-list">
              {carePlans.map(plan => (
                <div key={plan._id} className="careplan-card">
                  <h4>{plan.title}</h4>
                  <p><strong>Patient:</strong> {plan.patientId?.name}</p>
                  <p><strong>Diagnosis:</strong> {plan.diagnosis}</p>
                  <p><strong>Status:</strong> {plan.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <h3>Daily Tasks</h3>
            {tasks.map(t => (
              <div key={t._id} className={`task-card ${t.status}`}>
                <h4>{t.title}</h4>
                <p>{t.description}</p>
                {t.status === 'pending' && (
                  <button onClick={() => completeTask(t._id)}>Complete</button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'readings' && (
          <div className="readings-section">
            <h3>Flagged Readings</h3>
            {readings.map(r => (
              <div key={r._id} className={`reading-card ${r.alertLevel}`}>
                <h4>{r.patientId?.name}</h4>
                <p><strong>Type:</strong> {r.type}</p>
                <p><strong>Value:</strong> {r.value}</p>
                <p><strong>Alert:</strong> {r.alertLevel}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ClinicianDashboard;