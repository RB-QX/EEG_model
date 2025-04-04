import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBrain, FaChartBar, FaHistory, FaCog, FaSun, FaMoon, FaBars } from 'react-icons/fa';

const Sidebar = ({ darkMode, toggleDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${darkMode ? 'dark' : ''}`}
      style={{ transition: 'width 0.3s ease, transform 0.3s ease' }}
    >
      <div className="sidebar-header">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="collapse-btn"
          title="Toggle Menu"
          style={{ transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          <FaBars />
        </button>
        {!collapsed && <h2 className="brand">🧠 EEG Analysis</h2>}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FaHome /> {!collapsed && 'Dashboard'}
        </NavLink>
        <NavLink to="/input" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FaBrain /> {!collapsed && 'EEG Input'}
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FaChartBar /> {!collapsed && 'Analysis'}
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FaHistory /> {!collapsed && 'History'}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FaCog /> {!collapsed && 'Settings'}
        </NavLink>
      </nav>

      <footer className="sidebar-footer">
        {!collapsed && <div className="copyright">© 2025 EEG Analyzer</div>}
      </footer>
    </aside>
  );
};

export default Sidebar;
