// ================= Register.js =================
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Register() {
  const navigate = useNavigate();
  const AUTH_BASE = 'https://SelviaNasser-flora-auth.hf.space';
  const REGISTER_URL = `${AUTH_BASE.replace(/\/$/, '')}/register`;
  const LOGIN_URL = `${AUTH_BASE.replace(/\/$/, '')}/login`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (!email) return "Please enter an email.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Enter a valid email.";
    if (!password) return "Enter a password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return setError(data?.message || "Registration failed.");
      }

      // بعد التسجيل، نعمل login تلقائي للحصول على token
      const loginRes = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData?.message || 'Login failed after registration.');

      const token = loginData.token || loginData.access_token;
      if (!token) throw new Error('No token returned from server.');

      // حفظ الـ token في localStorage
      localStorage.setItem('auth_token', token);

      alert("Registered successfully! Logged in automatically.");
      navigate("/home");

    } catch (err) {
      console.error(err);
      setError(err.message || "Network error!");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Create a new account</h2>
        <p className="login-subtitle">Fill in your information below.</p>

        <form onSubmit={handleRegister}>
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="login-input" required />

          <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="login-input" required />

          <input type={showPassword ? "text" : "password"} placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} className="login-input" required />

          <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)}>
            {showPassword ? "Hide" : "Show"}
          </button>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div style={{ textAlign:"center", marginTop:"0.8rem" }}>
          Already have an account?
          <button className="login-link" onClick={() => navigate("/login")}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
