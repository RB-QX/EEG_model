import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const EEGInputForm = () => {
  const [features, setFeatures] = useState(Array(54).fill(0));
  const [result, setResult] = useState(null);
  const [confidences, setConfidences] = useState(null);

  const handleChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
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
    } catch (error) {
      setResult('Error occurred');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-grid">
        {features.map((val, i) => (
          <div key={i} className="form-group">
            <label htmlFor={`feature${i}`}>F{i}</label>
            <input
              type="number"
              id={`feature${i}`}
              value={val}
              onChange={(e) => handleChange(i, parseFloat(e.target.value))}
              required
            />
          </div>
        ))}
        <button type="submit">Predict</button>
      </form>

      {result && <h2>Predicted Class: {result}</h2>}

      {confidences && (
        <BarChart width={500} height={300} data={Object.entries(confidences).map(([label, value]) => ({ label, value }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      )}
    </div>
  );
};

export default EEGInputForm;
