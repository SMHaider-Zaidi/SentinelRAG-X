import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authApi } from '../api';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* ── Hero ── */}
      <div className="auth-hero">
        <div className="auth-hero-logo">
          <span>🛡️</span>
          <span>SentinelRAG-X</span>
        </div>

        <h2>
          Secure Document<br />
          <span style={{ color: 'var(--accent-cyan)' }}>Intelligence</span>
        </h2>
        <p>
          Retrieval-Augmented Generation with evidence traceability,
          document permissions, and quarantine controls — all running locally.
        </p>

        <ul className="auth-feature-list">
          {[
            ['🔐', 'Document-level access control'],
            ['🔍', 'Source-traced AI answers'],
            ['🚫', 'Quarantine & restore controls'],
            ['📋', 'Full audit logging'],
          ].map(([icon, label]) => (
            <li key={label}>
              <span className="auth-feature-icon">{icon}</span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Form Panel ── */}
      <div className="auth-panel">
        <div className="auth-form-wrap animate-slide-up">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to access your documents and AI assistant</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              id="login-submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
