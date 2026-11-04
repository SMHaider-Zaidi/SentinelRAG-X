import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';

export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('user');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authApi.register(name, email, password, role);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* Password strength */
  const strength = (() => {
    if (!password) return null;
    if (password.length < 6) return { level: 1, label: 'Weak',   color: 'var(--status-failed)' };
    if (password.length < 10) return { level: 2, label: 'Fair',   color: 'var(--status-processing)' };
    return { level: 3, label: 'Strong', color: 'var(--status-ready)' };
  })();

  return (
    <div className="auth-split">
      {/* ── Hero ── */}
      <div className="auth-hero">
        <div className="auth-hero-logo">
          <span>🛡️</span>
          <span>SentinelRAG-X</span>
        </div>

        <h2>
          Join the<br />
          <span style={{ color: 'var(--accent-cyan)' }}>Sentinel Network</span>
        </h2>
        <p>
          Create your account to start querying documents with full source
          traceability and evidence controls — no cloud API required.
        </p>

        <ul className="auth-feature-list">
          {[
            ['🤖', 'Local AI with Ollama — no data leaves your machine'],
            ['📄', 'PDF & TXT document ingestion'],
            ['🔗', 'Chunked, vectorized retrieval with pgvector'],
            ['🏛️', 'Academic CEP prototype'],
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
            <h1>Create account</h1>
            <p>Get started with your secure document workspace</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
              <span className="alert-icon">✅</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
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
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {strength && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, height: 3, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(strength.level / 3) * 100}%`,
                        background: strength.color,
                        borderRadius: 2,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Account role</label>
              <div className="role-toggle">
                {[
                  { value: 'user',  icon: '👤', label: 'User' },
                  { value: 'admin', icon: '🛡️', label: 'Admin' },
                ].map((r) => (
                  <label key={r.value} className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={() => setRole(r.value)}
                    />
                    <div className="role-card">
                      <span className="role-card-icon">{r.icon}</span>
                      <span className="role-card-label">{r.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              id="register-submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '0.25rem' }}
              disabled={loading || !!success}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
