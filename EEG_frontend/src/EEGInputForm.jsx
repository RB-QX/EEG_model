
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PredictionHistory from './PredictionHistory';

const EEGInputForm = () => {
  const [features, setFeatures] = useState(Array(54).fill(0));
  const [result, setResult] = useState(null);
  const [confidences, setConfidences] = useState(null);
  const [history, setHistory] = useState([]);

  const handleChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result.trim();
      const values = text.split(',').map(Number);
      if (values.length === 54 && values.every(v => !isNaN(v))) {
        setFeatures(values);
      } else {
        alert("CSV must contain exactly 54 numeric values in a single row.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setFeatures(Array(54).fill(0));
    setResult(null);
    setConfidences(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    features.forEach((val, i) => {
      payload[`feature${i}`] = val;
    });

    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResult(data.prediction);
      setConfidences(data.confidences || null);

      const timestamp = new Date().toLocaleString();
      setHistory(prev => [...prev, { prediction: data.prediction, timestamp }]);

    } catch (err) {
      setResult("Prediction failed.");
    }
  };

  const chartData = confidences
    ? Object.entries(confidences).map(([label, score]) => ({
        label,
        confidence: Math.round(score * 100),
      }))
    : [];

  return (
    <div className="eeg-card">
      <div className="eeg-card-header">
        <h3>EEG Data Input</h3>
        <div>
          <input type="file" accept=".csv" onChange={handleCSVUpload} />
          <button className="btn small" onClick={handleReset}>🔄 Reset</button>
        </div>
      </div>
      <form className="eeg-grid" onSubmit={handleSubmit}>
        {features.map((val, i) => (
          <input
            key={i}
            type="number"
            value={val}
            placeholder={`F${i}`}
            onChange={(e) => handleChange(i, parseFloat(e.target.value))}
          />
        ))}
        <button className="btn primary full" type="submit">⚡ Predict</button>
      </form>

      {result && <div className="result">Predicted: <strong>{result}</strong></div>}

      {confidences && (
        <div style={{ marginTop: '2rem', height: '300px' }}>
          <h4>Confidence Scores</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="confidence" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <PredictionHistory history={history} />
    </div>
  );
};

export default EEGInputForm;
