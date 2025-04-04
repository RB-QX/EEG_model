import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCards from './StatCards';
import EEGInputForm from './EEGInputForm';
import Login from './auth/Login';
import Register from './auth/Register';
import Profile from './auth/Profile';
import '../style.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className="container">
      <Sidebar />
      <div className="main">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={
              <>
                <h1>EEG Prediction Dashboard</h1>
                <EEGInputForm />
              </>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
