
import React from 'react';

const Header = ({ darkMode, setDarkMode }) => {
  return (
    <header className="topbar">
      <input type="text" placeholder="Search..." className="searchbar" />
      <div className="actions">
        <button className="btn secondary" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
        <button className="btn primary">+ New Analysis</button>
        <button className="btn secondary">Login</button>
      </div>
    </header>
  );
};

export default Header;
