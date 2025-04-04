import React from 'react';

const Header = ({ darkMode, setDarkMode }) => {
  return (
    <header className="topbar" style={{ animation: 'fadeIn 0.5s ease' }}>
      <input type="text" placeholder="Search..." className="searchbar" />
      <div className="actions">
        <button
          className="btn secondary"
          onClick={() => setDarkMode(!darkMode)}
          style={{ transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
        <button
          className="btn primary"
          style={{ transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          + New Analysis
        </button>
        <button className="btn secondary">Login</button>
      </div>
    </header>
  );
};

export default Header;
