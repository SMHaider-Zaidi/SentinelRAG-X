import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { auditApi } from '../api';

const EVENT_COLORS = {
  upload:            'badge-cyan',
  processing_failed: 'badge-failed',
  permission_grant:  'badge-ready',
  permission_revoke: 'badge-quarantined',
  quarantine:        'badge-quarantined',
  restore:           'badge-ready',
  question:          'badge-user',
  login:             'badge-admin',
  login_failed:      'badge-failed',
};

const EVENT_ICONS = {
  upload:            '📤',
  processing_failed: '❌',
  permission_grant:  '🔑',
  permission_revoke: '🚫',
  quarantine:        '🔒',
  restore:           '♻️',
  question:          '💬',
  login:             '🔐',
  login_failed:      '⚠️',
};

function EventBadge({ type }) {
  const cls  = EVENT_COLORS[type] || 'badge-cyan';
  const icon = EVENT_ICONS[type]  || '📋';
  return (
    <span className={`badge ${cls}`}>
      {icon} {type?.replace(/_/g, ' ') || 'unknown'}
    </span>
  );
}

const EVENT_TYPES = [
  '', 'upload', 'processing_failed', 'permission_grant', 'permission_revoke',
  'quarantine', 'restore', 'question', 'login', 'login_failed',
];

export default function AuditLog() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    const params = filter ? { event_type: filter } : {};
    setLoading(true);
    auditApi
      .list(params)
      .then((data) => setLogs(data.logs ?? data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <AppLayout>
      <div className="page-header-row page-header">
        <div>
          <h1>Audit Log</h1>
          <p>A record of all important actions taken in the system. Admin view only.</p>
        </div>
        <button
          id="btn-refresh-audit"
          className="btn btn-ghost btn-sm"
          onClick={() => setFilter(filter)} /* re-trigger useEffect */
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="card card-sm" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
          Filter by event:
        </label>
        <select
          id="audit-filter"
          className="form-select"
          style={{ maxWidth: 240 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All events</option>
          {EVENT_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {filter && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilter('')}>
            ✕ Clear filter
          </button>
        )}
        {!loading && (
          <span className="badge badge-cyan" style={{ marginLeft: 'auto' }}>
            {logs.length} event{logs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="loading-dots"><span /><span /><span /></div>
            <p style={{ marginTop: '1rem' }}>Loading audit events…</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-state-icon">📋</div>
            <h3>No audit events found</h3>
            <p>
              {filter
                ? `No "${filter.replace(/_/g, ' ')}" events recorded.`
                : 'No events have been logged yet. Actions like uploads, logins, and queries appear here.'}
            </p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Event</th>
                  <th>Target</th>
                  <th>Outcome</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.audit_id || log.id}>
                    <td style={{ whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : '—'}
                    </td>
                    <td className="text-strong">
                      {log.actor_name || log.actor_id?.slice(0, 8) || '—'}
                    </td>
                    <td>
                      <EventBadge type={log.event_type} />
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {log.object_type && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginRight: '0.35rem' }}>
                          {log.object_type}:
                        </span>
                      )}
                      {log.object_id?.slice(0, 12) || '—'}
                    </td>
                    <td>
                      <span
                        className={`badge ${log.outcome === 'success' ? 'badge-ready' : log.outcome === 'failure' ? 'badge-failed' : 'badge-cyan'}`}
                      >
                        {log.outcome || '—'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.reason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
        <span className="alert-icon">🔒</span>
        <span>
          Sensitive data such as passwords, tokens, and raw document content is never stored in
          audit logs.
        </span>
      </div>
    </AppLayout>
  );
}
