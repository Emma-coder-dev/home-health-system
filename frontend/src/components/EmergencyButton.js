import React from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function EmergencyButton({ patient, onEmergencyTriggered }) {
  const triggerEmergency = async () => {
    try {
      const response = await axios.post(`${API_URL}/emergencies`, {
        patientName: patient.name,
        message: 'Emergency assistance needed!'
      });
      alert(response.data.message);
      if (onEmergencyTriggered) {
        onEmergencyTriggered(response.data.emergency);
      }
    } catch (error) {
      console.error('Error triggering emergency:', error);
      alert('Error triggering emergency');
    }
  };

  return (
    <div className="patient-card">
      <h3>{patient.name}</h3>
      <p>Condition: {patient.condition}</p>
      <p>Age: {patient.age}</p>
      <button 
        className="emergency-btn"
        onClick={triggerEmergency}
      >
        🚨 EMERGENCY BUTTON
      </button>
    </div>
  );
}

export default EmergencyButton;