import React, { useEffect, useState } from "react";
import "./Login_SignUp.css";
import { useNavigate } from "react-router-dom";

const Login_Signup = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [success, setSuccess] = useState(false); // Used to show success message after registration
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleMode = () => { // Toggles between Login and Register modes
    setIsLogin(!isLogin);
    setSuccess(false);
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleSubmit = async (e) => { // Handles form submission for Login or Register
    e.preventDefault();
    const endpoint = isLogin ? "/api/login" : "/api/register";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (!isLogin) {
          setSuccess(true);
          setTimeout(() => {
            setIsLogin(true);
            setSuccess(false);
          }, 2500);
        } else {
          navigate("/dashboard");
        }
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (err) {
      alert("Server error. Please try again later.");
      console.error(err);
    }
  };

  return (
    <div className={`login-signup-container ${darkMode ? "dark" : ""}`}>
      <div className="form-box animated-slide-in">
        <div className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌙" : "🌞"}
        </div>
        <div className="logo-container bounce-glow">🧠</div>
        <h2 className="title">{isLogin ? "Login" : "Register"}</h2>
        {success ? (
          <div className="success-msg">✅ Registration successful! Redirecting to Login...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group fade-in">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="input-group fade-in">
              <input
                type="email"
                placeholder="Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group fade-in">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="actions">
              <button
                type="button"
                className={`toggle-btn ${!isLogin ? "active" : ""}`}
                onClick={toggleMode}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
              <button type="submit" className="submit-btn">
                {isLogin ? "Login" : "Register"}
              </button>
            </div>
          </form>
        )}
        {isLogin && !success && (
          <p className="forgot-text">
            Forgot Password? <a href="#">Click Here</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login_Signup;
