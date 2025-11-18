import React, { useState } from 'react';
import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

function PatientRegistration() {
  const [form, setForm] = useState({
    name: '',
    age: '',
    condition: '',
    address: '',
    email: ''
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
      await axios.post(`${API_URL}/patients`, form);
      alert(`✅ Patient ${form.name} registered successfully!\n\nThey can now access their patient portal.`);
      setForm({ name: '', age: '', condition: '', address: '', email: '' });
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error registering patient');
    }
  };

  return (
    <div className="form-section">
      <h2>Register New Patient for Home Health Care</h2>
      <p className="form-description">
        Register patients to give them access to the Home Health monitoring system.
        After registration, they can access their personal patient portal.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
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
          placeholder="Medical Condition (e.g., Diabetes, Heart Disease)"
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
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
        />
        <button type="submit">Register Patient & Create Portal</button>
      </form>
    </div>
  );
}

export default PatientRegistration;