import React from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function DataCard({ title, data, type = 'patient', onDataUpdate }) {
  const resolveEmergency = async (emergencyId) => {
    try {
      await axios.put(`${API_URL}/emergencies/${emergencyId}/resolve`);
      if (onDataUpdate) {
        onDataUpdate();
      }
      alert('Emergency marked as resolved!');
    } catch (error) {
      console.error('Error resolving emergency:', error);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'patient':
        return data.map(item => (
          <div key={item._id} className="data-card">
            <h4>{item.name}</h4>
            <p><strong>Age:</strong> {item.age}</p>
            <p><strong>Condition:</strong> {item.condition}</p>
            <p><strong>Address:</strong> {item.address}</p>
            <p><strong>Registered:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
        ));
      
      case 'reading':
        return data.map(item => {
          // Determine if reading needs attention
          let alertLevel = 'normal';
          let alertMessage = '';
          
          if (item.type === 'blood_pressure') {
            const [systolic, diastolic] = item.value.split('/').map(Number);
            if (systolic > 130 || diastolic > 85) {
              alertLevel = 'high';
              alertMessage = 'High BP';
            } else if (systolic < 90 || diastolic < 60) {
              alertLevel = 'low';
              alertMessage = 'Low BP';
            }
          }
          else if (item.type === 'heart_rate') {
            const bpm = parseInt(item.value);
            if (bpm > 100) {
              alertLevel = 'high';
              alertMessage = 'High HR';
            } else if (bpm < 60) {
              alertLevel = 'low';
              alertMessage = 'Low HR';
            }
          }
          else if (item.type === 'glucose') {
            const glucose = parseInt(item.value);
            if (glucose > 140) {
              alertLevel = 'high';
              alertMessage = 'High Glucose';
            } else if (glucose < 80) {
              alertLevel = 'low';
              alertMessage = 'Low Glucose';
            }
          }
          
          return (
            <div key={item._id} className={`data-card reading-card ${alertLevel !== 'normal' ? 'alert-reading' : ''}`}>
              <div className="reading-header">
                <span className="reading-type">{item.type}</span>
                {alertLevel !== 'normal' && (
                  <span className={`alert-badge ${alertLevel}`}>
                    ⚠️ {alertMessage}
                  </span>
                )}
              </div>
              <p><strong>Value:</strong> {item.value}</p>
              <p><strong>Patient ID:</strong> {item.patientId}</p>
              <p><strong>Time:</strong> {new Date(item.createdAt).toLocaleString()}</p>
            </div>
          );
        });
      
      case 'emergency':
        return data.map(item => (
          <div key={item._id} className={`data-card emergency-alert ${item.status === 'resolved' ? 'resolved' : 'active'}`}>
            <div className="emergency-header">
              <h4>🚨 {item.status === 'resolved' ? 'RESOLVED EMERGENCY' : 'ACTIVE EMERGENCY'}</h4>
              <span className={`status-badge ${item.status}`}>
                {item.status.toUpperCase()}
              </span>
            </div>
            <p><strong>Patient:</strong> {item.patientName}</p>
            <p><strong>Time:</strong> {new Date(item.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong>Message:</strong> {item.message}</p>
            {item.status === 'pending' && (
              <button 
                className="resolve-btn"
                onClick={() => resolveEmergency(item._id)}
              >
                ✅ Mark Resolved
              </button>
            )}
            {item.status === 'resolved' && item.resolvedAt && (
              <p><strong>Resolved At:</strong> {new Date(item.resolvedAt).toLocaleString()}</p>
            )}
          </div>
        ));
      
      default:
        return null;
    }
  };

  return (
    <div className="data-column">
      <h3>{title} ({data.length})</h3>
      {renderContent()}
    </div>
  );
}

export default DataCard;