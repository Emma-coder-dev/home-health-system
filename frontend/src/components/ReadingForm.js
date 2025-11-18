import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function ReadingForm({ onReadingAdded }) {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    type: 'blood_pressure',
    value: ''
  });

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/readings`, form);
      alert('Health reading recorded successfully!');
      setForm({ patientId: '', type: 'blood_pressure', value: '' });
      if (onReadingAdded) {
        onReadingAdded(response.data);
      }
    } catch (error) {
      console.error('Error adding reading:', error);
      alert('Error recording reading');
    }
  };

  return (
    <div className="form-section">
      <h2>Record Health Reading</h2>
      <form onSubmit={handleSubmit}>
        <select
          name="patientId"
          value={form.patientId}
          onChange={handleChange}
          required
        >
          <option value="">Select Patient</option>
          {patients.map(patient => (
            <option key={patient._id} value={patient._id}>
              {patient.name} - {patient.condition}
            </option>
          ))}
        </select>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
        >
          <option value="blood_pressure">Blood Pressure</option>
          <option value="heart_rate">Heart Rate</option>
          <option value="glucose">Glucose Level</option>
        </select>
        <input
          type="text"
          name="value"
          placeholder="Reading Value (e.g., 120/80, 72 bpm, 110 mg/dL)"
          value={form.value}
          onChange={handleChange}
          required
        />
        <button type="submit">Record Reading</button>
      </form>
    </div>
  );
}

export default ReadingForm;