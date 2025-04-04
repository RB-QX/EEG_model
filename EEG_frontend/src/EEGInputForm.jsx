import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PredictionHistory from './PredictionHistory';
import StatCards from './StatCards';

const EEGInputForm = () => {
  const [features, setFeatures] = useState(Array(54).fill(0));
  const [result, setResult] = useState(null);
  const [confidences, setConfidences] = useState(null);
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [confidencePercent, setConfidencePercent] = useState(0);
  const [processingTime, setProcessingTime] = useState([]);

  // ✅ Load saved data on page load
  useEffect(() => {
    const savedResult = localStorage.getItem("result");
    const savedConfidences = localStorage.getItem("confidences");
    const savedHistory = localStorage.getItem("history");
    const savedFeatures = localStorage.getItem("features");

    if (savedResult) setResult(savedResult);
    if (savedConfidences) {
      const parsed = JSON.parse(savedConfidences);
      setConfidences(parsed);
      const max = Math.max(...Object.values(parsed));
      setConfidencePercent(Math.round(max * 100));
    }
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
      setTotal(parsed.length);
    }
    if (savedFeatures) setFeatures(JSON.parse(savedFeatures));
  }, []);

  const handleChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
    localStorage.setItem("features", JSON.stringify(updated)); // ✅ Save live edits
  };

  const handleReset = () => {
    const cleared = Array(54).fill(0);
    setFeatures(cleared);
    setResult(null);
    setConfidences(null);
    setConfidencePercent(0);
    setProcessingTime(0);
    localStorage.removeItem("result");
    localStorage.removeItem("confidences");
    localStorage.removeItem("features");
  };

  const handleClearAll = () => {
    setFeatures(Array(54).fill(0));
    setResult(null);
    setConfidences(null);
    setHistory([]);
    setTotal(0);
    setConfidencePercent(0);
    setProcessingTimes([]);

    const darkMode = localStorage.getItem("darkMode"); // Preserve before clear
    localStorage.clear();                              // Clear all
    if (darkMode) localStorage.setItem("darkMode", darkMode); // Restore dark mode
    
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
        localStorage.setItem("features", JSON.stringify(values)); // ✅ Save uploaded values
      } else {
        alert("CSV must contain exactly 54 numeric values in a single row.");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    features.forEach((val, i) => {
      payload[`feature${i}`] = val;
    });

    const start = performance.now();

    try {
      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const end = performance.now();
      const timeTaken = Math.round(end - start);

      setResult(data.prediction);
      setConfidences(data.confidences || null);
      setProcessingTime(timeTaken);
      setConfidencePercent(
        Math.round(Math.max(...Object.values(data.confidences || {})) * 100)
      );

      localStorage.setItem("result", data.prediction);
      localStorage.setItem("confidences", JSON.stringify(data.confidences || {}));

      const timestamp = new Date().toLocaleString();
      const newEntry = { 
        prediction: data.prediction, 
        timestamp,
        confidences: data.confidences 
      };
      const updatedHistory = [...history, newEntry];
      setHistory(updatedHistory);
      setTotal(updatedHistory.length);
      localStorage.setItem("history", JSON.stringify(updatedHistory));

    } catch (err) {
      setResult("Prediction failed.");
    }
  };

  const restoreFromHistory = (entry) => {
    setResult(entry.prediction);
    setConfidences(entry.confidences || null);
    if (entry.confidences) {
      const max = Math.max(...Object.values(entry.confidences));
      setConfidencePercent(Math.round(max * 100));
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
       <StatCards
        total={total}
        confidencePercent={confidencePercent}
        processingTime={processingTime}
      />
  
        <div className="eeg-card-header">
          <h3>EEG Data Input</h3>
          <div className="btn-group">
            <input type="file" accept=".csv" onChange={handleCSVUpload} />
            <button className="btn small" onClick={handleReset}>🔄 Reset Inputs</button>
            <button className="btn small danger" onClick={handleClearAll}>🧹 Clear All</button>
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
              style={{ transition: 'all 0.3s ease', transform: 'scale(1)' }}
              onFocus={(e) => (e.target.style.transform = 'scale(1.05)')}
              onBlur={(e) => (e.target.style.transform = 'scale(1)')}
            />
          ))}
        </form>
  
        <div className="predict-container">
          <button
            className="btn primary"
            onClick={handleSubmit}
            style={{ transition: 'background-color 0.3s ease, transform 0.3s ease' }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            ⚡ Predict
          </button>
        </div>
  
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
  
        <PredictionHistory history={history} onRestore={restoreFromHistory} />
      </div>
    );
  };
  
  export default EEGInputForm;

