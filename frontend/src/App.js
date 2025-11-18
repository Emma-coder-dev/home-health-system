import React, { useState } from 'react';
import './App.css';
import PatientRegistration from './pages/PatientRegistration';
import PatientPortals from './pages/PatientPortals';
import StaffDashboard from './pages/StaffDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('registration');

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏥 General Hospital Home Health System</h1>
        <nav>
          <button 
            className={activeTab === 'registration' ? 'active' : ''}
            onClick={() => setActiveTab('registration')}
          >
            Patient Registration
          </button>
          <button 
            className={activeTab === 'portals' ? 'active' : ''}
            onClick={() => setActiveTab('portals')}
          >
            Patient Portals
          </button>
          <button 
            className={activeTab === 'staff' ? 'active' : ''}
            onClick={() => setActiveTab('staff')}
          >
            Staff Dashboard
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'registration' && <PatientRegistration />}
        {activeTab === 'portals' && <PatientPortals />}
        {activeTab === 'staff' && <StaffDashboard />}
      </main>
    </div>
  );
}

export default App;