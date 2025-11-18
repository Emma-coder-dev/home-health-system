import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function PatientPortals() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${API_URL}/patients`);
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  const loadPatientData = async (patient) => {
    setSelectedPatient(patient);
    try {
      const readingsRes = await axios.get(`${API_URL}/readings`);
      const patientReadings = readingsRes.data.filter(
        reading => reading.patientId === patient._id
      );
      setReadings(patientReadings);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const triggerEmergency = async () => {
    if (!selectedPatient) return;
    try {
      await axios.post(`${API_URL}/emergencies`, {
        patientName: selectedPatient.name,
        message: 'Patient triggered emergency button from home portal!'
      });
      alert('🆘 EMERGENCY ALERT SENT! Help is on the way!');
    } catch (error) {
      console.error('Error triggering emergency:', error);
    }
  };

  const simulateDeviceReading = async (type) => {
    if (!selectedPatient) return;
    
    // Generate random realistic values for each device type
    let value = '';
    
    switch (type) {
      case 'blood_pressure':
        const systolic = Math.floor(Math.random() * 40) + 100; // 100-140
        const diastolic = Math.floor(Math.random() * 25) + 70; // 70-95
        value = `${systolic}/${diastolic}`;
        break;
        
      case 'heart_rate':
        const bpm = Math.floor(Math.random() * 60) + 50; // 50-110 bpm
        value = `${bpm} bpm`;
        break;
        
      case 'glucose':
        const glucose = Math.floor(Math.random() * 100) + 70; // 70-170 mg/dL
        value = `${glucose} mg/dL`;
        break;
        
      default:
        value = 'Unknown reading';
    }
    
    try {
      await axios.post(`${API_URL}/readings`, {
        patientId: selectedPatient._id,
        type,
        value,
        automated: true
      });
      
      // Show appropriate message based on reading value
      let message = `✅ ${type.replace('_', ' ')} reading submitted: ${value}`;
      
      // Add health status indicators
      if (type === 'blood_pressure') {
        const [systolic, diastolic] = value.split('/').map(Number);
        if (systolic > 130 || diastolic > 85) {
          message += `\n⚠️ High blood pressure detected`;
        } else if (systolic < 90 || diastolic < 60) {
          message += `\n⚠️ Low blood pressure detected`;
        }
      }
      else if (type === 'heart_rate') {
        const bpm = parseInt(value);
        if (bpm > 100) {
          message += `\n⚠️ Elevated heart rate`;
        } else if (bpm < 60) {
          message += `\n⚠️ Low heart rate`;
        }
      }
      else if (type === 'glucose') {
        const glucose = parseInt(value);
        if (glucose > 140) {
          message += `\n⚠️ High glucose level`;
        } else if (glucose < 80) {
          message += `\n⚠️ Low glucose level`;
        }
      }
      
      alert(message);
      
      // Refresh readings
      const readingsRes = await axios.get(`${API_URL}/readings`);
      const patientReadings = readingsRes.data.filter(
        reading => reading.patientId === selectedPatient._id
      );
      setReadings(patientReadings);
    } catch (error) {
      console.error('Error submitting reading:', error);
    }
  };

  return (
    <div className="patient-portals-page">
      <h2>Patient Portals</h2>
      
      {/* Patient Selection */}
      <div className="patient-selection">
        <h3>Select Patient Portal</h3>
        <div className="patients-grid">
          {patients.map(patient => (
            <div 
              key={patient._id} 
              className={`patient-card ${selectedPatient?._id === patient._id ? 'selected' : ''}`}
              onClick={() => loadPatientData(patient)}
            >
              <h4>{patient.name}</h4>
              <p>Age: {patient.age}</p>
              <p>Condition: {patient.condition}</p>
              <p>📍 {patient.address}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Portal */}
      {selectedPatient && (
        <div className="patient-portal">
          <div className="portal-header">
            <h3>🏠 {selectedPatient.name}'s Home Health Portal</h3>
            <p>Welcome to your personal health monitoring portal</p>
          </div>

          <div className="portal-sections">
            {/* Emergency Section */}
            <section className="emergency-section">
              <h4>Emergency Assistance</h4>
              <p>Press this button if you need immediate medical help</p>
              <button 
                className="big-emergency-btn"
                onClick={triggerEmergency}
              >
                🚨 LIFELINE EMERGENCY BUTTON
              </button>
            </section>

            {/* Health Devices */}
            <section className="devices-section">
              <h4>Your Health Monitoring Devices</h4>
              <p>Simulate your home health devices sending random readings to the hospital</p>
              
              <div className="device-buttons">
                <button onClick={() => simulateDeviceReading('blood_pressure')}>
                  💓 Take Blood Pressure Reading
                </button>
                <button onClick={() => simulateDeviceReading('heart_rate')}>
                  ❤️ Take Heart Rate Reading
                </button>
                <button onClick={() => simulateDeviceReading('glucose')}>
                  🩸 Take Glucose Reading
                </button>
              </div>
              
              <div className="device-info">
                <p><strong>Note:</strong> Each click generates a new random realistic reading. Abnormal readings will trigger alerts for hospital staff.</p>
              </div>
            </section>

            {/* Health Data */}
            <section className="readings-section">
              <h4>Your Health Data</h4>
              {readings.length === 0 ? (
                <p>No health readings yet. Use your devices above to start monitoring.</p>
              ) : (
                <div className="readings-list">
                  {readings.map(reading => (
                    <div key={reading._id} className="reading-item">
                      <span className="reading-type">{reading.type}</span>
                      <span className="reading-value">{reading.value}</span>
                      <span className="reading-time">
                        {new Date(reading.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {patients.length === 0 && (
        <div className="no-patients">
          <p>No patients registered yet.</p>
          <p>Go to <strong>Patient Registration</strong> to add patients first.</p>
        </div>
      )}
    </div>
  );
}

export default PatientPortals;