import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function PatientForm({ onPatientAdded }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    condition: '',
    address: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/patients`, form);
      alert('Patient registered successfully!');
      setForm({ name: '', age: '', condition: '', address: '' });
      if (onPatientAdded) {
        onPatientAdded(response.data);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error registering patient');
    }
  };

  return (
    <div className="form-section">
      <h2>Register New Patient</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Patient Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="condition"
          placeholder="Medical Condition"
          value={form.condition}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Home Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <button type="submit">Register Patient</button>
      </form>
    </div>
  );
}

export default PatientForm;