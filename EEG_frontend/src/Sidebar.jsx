import React from 'react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>🧠 EEG Analysis</h2>
      <nav>
        <ul>
          <li className="active">Dashboard</li>
          <li>EEG Input</li>
          <li>Analysis</li>
          <li>History</li>
          <li>Settings</li>
        </ul>
      </nav>
      <footer>© 2025 EEG Analyzer</footer>
    </aside>
  );
};

export default Sidebar;
