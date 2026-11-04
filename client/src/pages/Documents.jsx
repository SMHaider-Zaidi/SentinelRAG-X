import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { documentsApi } from '../api/documentsApi';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
  const { user, token, logout } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const docs = await documentsApi.list(token);
      setDocuments(docs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);

      await documentsApi.upload(token, formData);
      setSuccess('Document uploaded successfully and queued for processing!');
      setFile(null);
      setTitle('');
      fetchDocs();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <header className="nav-bar">
        <h2>SentinelRAG-X Documents</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">Dashboard</button>
          <button onClick={logout} className="btn btn-danger btn-sm">Logout</button>
        </div>
      </header>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>✅ {success}</div>}

      {user?.role === 'admin' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Upload New Document (Admin)</h3>
          <form onSubmit={handleUpload} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Document Title (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Company Policy 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Select PDF or TXT File</label>
              <input
                type="file"
                accept=".pdf,.txt"
                className="form-input"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Uploading & Processing...' : 'Upload Document'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Accessible Documents</h3>
        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>No documents found.</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Title</th>
                  <th style={{ padding: '10px' }}>Uploader</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Uploaded At</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.document_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{doc.title}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{doc.uploader_name || 'Admin'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: doc.status === 'ready' ? 'rgba(16, 185, 129, 0.15)' : doc.status === 'processing' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: doc.status === 'ready' ? '#10b981' : doc.status === 'processing' ? '#f59e0b' : '#ef4444'
                      }}>
                        {doc.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{new Date(doc.uploaded_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
