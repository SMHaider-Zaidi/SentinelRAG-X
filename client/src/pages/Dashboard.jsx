import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { documentsApi } from '../api';

function StatCard({ icon, value, label, accent, delay = 0 }) {
  return (
    <div
      className="stat-card animate-slide-up"
      style={{
        '--accent-gradient': accent,
        '--icon-bg': `${accent.match(/#[0-9a-f]+/i)?.[0]}22`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {icon}
      </div>
      <div className="stat-card-value">{value ?? '—'}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [docs, setDocs]       = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);

  useEffect(() => {
    documentsApi
      .list()
      .then((data) => setDocs(data.documents ?? data ?? []))
      .catch(() => setDocs([]))
      .finally(() => setDocsLoading(false));
  }, []);

  const readyDocs     = docs.filter((d) => d.status === 'ready');
  const processingDocs = docs.filter((d) => d.status === 'processing');

  return (
    <AppLayout>
      {/* Header */}
      <div className="page-header">
        <h1>
          Welcome back,{' '}
          <span style={{ color: 'var(--accent-cyan)' }}>{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p>Here's an overview of your secure document workspace.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid-cols-4 stagger" style={{ marginBottom: '2rem' }}>
        <StatCard
          icon="📁"
          value={docsLoading ? '…' : docs.length}
          label="Total Documents"
          accent="linear-gradient(90deg, #00d4ff, #3b82f6)"
          delay={0}
        />
        <StatCard
          icon="✅"
          value={docsLoading ? '…' : readyDocs.length}
          label="Ready"
          accent="linear-gradient(90deg, #10b981, #059669)"
          delay={80}
        />
        <StatCard
          icon="⏳"
          value={docsLoading ? '…' : processingDocs.length}
          label="Processing"
          accent="linear-gradient(90deg, #f59e0b, #d97706)"
          delay={160}
        />
        <StatCard
          icon="🔒"
          value={user?.role === 'admin' ? 'Admin' : 'User'}
          label="Your Access Level"
          accent="linear-gradient(90deg, #8b5cf6, #6d28d9)"
          delay={240}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        {/* Primary CTA */}
        <div className="card animate-slide-up" style={{ animationDelay: '320ms' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>
            {user?.role === 'admin' ? '📤 Upload Documents' : '💬 Ask a Question'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {user?.role === 'admin'
              ? 'Add PDF or TXT files to the knowledge base and make them available to users.'
              : 'Query your accessible documents with AI-powered retrieval and source tracing.'}
          </p>
          <button
            id="dashboard-primary-action"
            className="btn btn-primary"
            onClick={() => navigate(user?.role === 'admin' ? '/documents' : '/chat')}
          >
            {user?.role === 'admin' ? '📤 Go to Documents' : '💬 Start Asking'}
          </button>
        </div>

        {/* Secondary CTA */}
        <div className="card animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>
            {user?.role === 'admin' ? '💬 Try the AI Assistant' : '📄 Browse Documents'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {user?.role === 'admin'
              ? 'Test question answering with your uploaded documents and inspect retrieved source evidence.'
              : 'View all documents you have permission to access in this workspace.'}
          </p>
          <button
            id="dashboard-secondary-action"
            className="btn btn-ghost"
            onClick={() => navigate(user?.role === 'admin' ? '/chat' : '/documents')}
          >
            {user?.role === 'admin' ? '💬 Open Chat' : '📄 View Documents'}
          </button>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="card animate-slide-up" style={{ animationDelay: '480ms' }}>
        <div className="page-header-row" style={{ marginBottom: '1rem' }}>
          <h3>Recent Documents</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/documents')}>
            View all →
          </button>
        </div>

        {docsLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading-dots">
              <span /><span /><span />
            </div>
          </div>
        ) : docs.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <div className="empty-state-icon">📭</div>
            <h3>No documents yet</h3>
            <p>
              {user?.role === 'admin'
                ? 'Upload your first document to get started.'
                : 'No documents have been shared with you yet.'}
            </p>
            {user?.role === 'admin' && (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/documents')}>
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {docs.slice(0, 5).map((doc) => (
                  <tr key={doc.document_id || doc.id}>
                    <td className="text-strong">
                      📄 {doc.title || doc.file_reference || 'Untitled'}
                    </td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Info */}
      <div
        className="alert alert-info animate-slide-up"
        style={{ marginTop: '1.5rem', animationDelay: '560ms' }}
      >
        <span className="alert-icon">🤖</span>
        <span>
          <strong>Local AI mode:</strong> All embeddings and answers are generated by your local Ollama
          instance. No data leaves your machine.
        </span>
      </div>
    </AppLayout>
  );
}

function StatusBadge({ status }) {
  const map = {
    ready:       { cls: 'badge-ready',       label: 'Ready',       dot: false },
    processing:  { cls: 'badge-processing',  label: 'Processing',  dot: true  },
    failed:      { cls: 'badge-failed',      label: 'Failed',      dot: false },
    quarantined: { cls: 'badge-quarantined', label: 'Quarantined', dot: false },
  };
  const cfg = map[status] || { cls: 'badge-cyan', label: status || 'Unknown', dot: false };
  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.dot && <span className="badge-dot pulse" />}
      {cfg.label}
    </span>
  );
}
