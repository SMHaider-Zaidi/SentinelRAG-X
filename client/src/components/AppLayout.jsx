import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
  { path: '/documents', icon: '📄', label: 'Documents' },
  { path: '/chat',      icon: '💬', label: 'Ask Questions' },
];

const ADMIN_ITEMS = [
  { path: '/audit', icon: '📋', label: 'Audit Log' },
];

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AppLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleNav = (path) => navigate(path);
  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">🛡️ SentinelRAG-X</span>
          <span className="sidebar-logo-sub">Secure Document AI</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>
                Admin
              </div>
              {ADMIN_ITEMS.map((item) => (
                <button
                  key={item.path}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => handleNav(item.path)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">
                <span className={`badge badge-${user?.role || 'user'}`} style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <button
            id="nav-logout"
            className="btn btn-ghost btn-sm btn-full"
            onClick={handleLogout}
            style={{ justifyContent: 'center' }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="page-content">{children}</main>
    </div>
  );
}
