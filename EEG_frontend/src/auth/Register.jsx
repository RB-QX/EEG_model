import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error);

      alert('Registration successful!');
      navigate('/login');
    } catch (err) {
      alert('Registration failed. Server error.');
    }
  };

  return (
    <>
      <div className="auth-toggle">
        <button
          className={window.location.pathname === "/login" ? "active" : ""}
          onClick={() => window.location.href = "/login"}
        >
          Login
        </button>
        <button
          className={window.location.pathname === "/register" ? "active" : ""}
          onClick={() => window.location.href = "/register"}
        >
          Register
        </button>
      </div>
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Name" value={name}
            onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn primary" type="submit">Register</button>
        </form>
      </div>
    </>
  );
};

export default Register;
