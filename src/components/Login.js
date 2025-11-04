import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const AUTH_BASE = 'https://SelviaNasser-flora-auth.hf.space';
  const LOGIN_URL = `${AUTH_BASE.replace(/\/$/, '')}/login`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const validate = () => {
    if (!email) return 'Please enter your email.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Please provide a valid email.';
    if (!password) return 'Please enter your password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || `Login failed. Status: ${res.status}`);
        setLoading(false);
        return;
      }

      const token = data.token || data.access_token;
      if (!token) {
        setError('No token returned from server.');
        setLoading(false);
        return;
      }

      // حفظ الـ token في التخزين المناسب
      if (remember) {
        localStorage.setItem('auth_token', token);
      } else {
        sessionStorage.setItem('auth_token', token);
      }

      // تنظيف الحقول بعد login ناجح
      setEmail('');
      setPassword('');
      
      setLoading(false);
      navigate('/home');

    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const goRegister = () => navigate('/register');

  const handleDemoLogin = () => {
    // بيانات تجريبية للاختبار
    setEmail('demo@example.com');
    setPassword('demo123');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Sign in to your account</h2>
        <p className="login-subtitle">Enter your credentials to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="login-input"
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="login-input"
                required
                autoComplete="current-password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(s => !s)} 
                className="password-toggle"
                tabIndex="-1"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input 
                type="checkbox" 
                checked={remember} 
                onChange={e => setRemember(e.target.checked)} 
              />
              <span>Remember me</span>
            </label>
            
            <button type="button" className="forgot-password">
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          {/* زر Demo للاختبار */}
          <button 
            type="button" 
            className="demo-btn"
            onClick={handleDemoLogin}
          >
            Fill Demo Credentials
          </button>
        </form>

        <div className="login-footer">
          Don't have an account? 
          <button className="login-link" onClick={goRegister}>
            Register now
          </button>
        </div>
      </div>
    </div>
  );
}