import React from 'react';

const StatCards = ({ total = 0, confidencePercent = 0, processingTimes = [] }) => {
  const averageProcessingTime =
    processingTimes.length > 0
      ? Math.round(
          processingTimes.reduce((sum, val) => sum + val, 0) / processingTimes.length
        )
      : 0;

  const format = (val, suffix = '') => (val === 0 ? '--' : `${val}${suffix}`);

  return (
    <div className="stats-row">
      <div className="stat-card">🔍 Total Analyses<br /><strong>{format(total)}</strong></div>
      <div className="stat-card">✅ Success Rate<br /><strong>100%</strong></div>
      <div className="stat-card">⏱ Avg. Processing<br /><strong>{format(averageProcessingTime, 'ms')}</strong></div>
      <div className="stat-card">📊 Confidence<br /><strong>{format(confidencePercent, '%')}</strong></div>
    </div>
  );
};

export default StatCards;
