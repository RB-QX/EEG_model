
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCards from './StatCards';
import EEGInputForm from './EEGInputForm';
import '../style.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  return (
    <div className="container">
      <Sidebar />
      <div className="main">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="content">
          <h1>EEG Prediction Dashboard</h1>
          <StatCards />
          <EEGInputForm />
        </main>
      </div>
    </div>
  );
};

export default App;
