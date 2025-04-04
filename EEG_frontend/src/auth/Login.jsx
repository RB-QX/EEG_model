import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill all fields.");

    // Simulate login
    const user = { email };
    localStorage.setItem("user", JSON.stringify(user));
    navigate('/profile');
  };

  return (
    <div className="auth-card">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn primary" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
