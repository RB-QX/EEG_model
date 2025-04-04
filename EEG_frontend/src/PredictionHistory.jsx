import React from 'react';

const PredictionHistory = ({ history }) => {
  return (
    <div style={{ marginTop: '2rem' }}>
      <h4>Prediction History</h4>
      {history.length === 0 ? (
        <p>No predictions yet.</p>
      ) : (
        <ul className="history-list">
          {history.map((entry, index) => (
            <li
              key={index}
              onClick={() => onRestore(entry)}
              style={{
                cursor: 'pointer',
                animation: `slideIn 0.3s ease ${index * 0.1}s`,
                animationFillMode: 'forwards',
                opacity: 0,
              }}
            >
              🧠 <strong>{entry.prediction}</strong> — <span>{entry.timestamp}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PredictionHistory;
