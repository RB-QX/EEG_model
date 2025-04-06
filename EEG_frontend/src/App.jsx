import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCards from './StatCards';
import EEGInputForm from './EEGInputForm';
import Profile from './auth/Profile';
import PrivateRoute from './PrivateRoute';
import '../style.css';
import Login_SignUp from './Login_SignUP/Login_SignUp';

const App = () => {
  const location = useLocation();
  const isLoginSignup = location.pathname === "/";

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
      {isLoginSignup ? (
        <Login_SignUp />
      ) : (
        <>
          <Sidebar />
          <div className="main">
            <Header darkMode={darkMode} setDarkMode={setDarkMode} />
            <main className="content">
              <Routes>
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/input"
                  element={
                    <PrivateRoute>
                      <StatCards />
                      <EEGInputForm />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
