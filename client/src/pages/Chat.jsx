import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { chatApi } from '../api';

/* ── Helpers ──────────────────────────────────────────────── */
function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ── Source Panel ─────────────────────────────────────────── */
function SourcesPanel({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length === 0) return null;

  return (
    <div>
      <button className="sources-toggle" onClick={() => setOpen((o) => !o)}>
        <span>{open ? '▾' : '▸'}</span>
        {sources.length} source{sources.length !== 1 ? 's' : ''} retrieved
      </button>
      {open && (
        <div className="sources-panel">
          {sources.map((src, i) => (
            <div key={i} className="source-item">
              <div className="source-title">📄 {src.title || src.document_title || 'Untitled'}</div>
              {src.page_number && (
                <div className="source-page">Page {src.page_number}</div>
              )}
              <div className="source-excerpt">{src.excerpt || src.extracted_text || '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Message Bubble ───────────────────────────────────────── */
function Message({ msg, userName }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user-row' : ''}`}>
      <div className={`message-avatar ${isUser ? 'user-avatar-msg' : 'ai-avatar'}`}>
        {isUser ? getInitials(userName) : '🛡'}
      </div>

      <div>
        <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
          {msg.content}

          {/* Evidence badge for AI messages */}
          {!isUser && msg.evidenceStatus && (
            <div>
              <span
                className="evidence-badge"
                title="This is a prototype heuristic based on retrieval similarity — not a truth guarantee."
              >
                ⚗️ Evidence: {msg.evidenceStatus}
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}> (heuristic)</span>
              </span>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && msg.sources && (
          <div style={{ paddingLeft: '0.25rem', marginTop: '0.25rem' }}>
            <SourcesPanel sources={msg.sources} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Thinking Indicator ───────────────────────────────────── */
function ThinkingBubble() {
  return (
    <div className="message-row">
      <div className="message-avatar ai-avatar">🛡</div>
      <div className="message-bubble ai-bubble" style={{ padding: '0.85rem 1.25rem' }}>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

/* ── Suggestion Chips ─────────────────────────────────────── */
const SUGGESTIONS = [
  'What documents are available to me?',
  'Summarize the key points of my documents.',
  'What does the evidence say about…?',
  'Are there any quarantined sections?',
];

/* ── Main Page ────────────────────────────────────────────── */
export default function Chat() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [thinking, setThinking] = useState(false);
  const [aiError, setAiError]   = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const sendMessage = async (question) => {
    const q = (question || input).trim();
    if (!q || thinking) return;

    setInput('');
    setAiError('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setThinking(true);

    try {
      const data = await chatApi.query(q);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: data.answer || data.response || 'No response received.',
          sources: data.sources || data.source_references || [],
          evidenceStatus: data.evidence_status || data.evidenceStatus || null,
        },
      ]);
    } catch (err) {
      const msg = err.message || 'Unknown error';
      const isAiDown = msg.toLowerCase().includes('ollama') || msg.toLowerCase().includes('connect');
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: isAiDown
            ? '⚡ The local AI service (Ollama) appears to be unavailable. Please ensure Ollama is running and your model is pulled.'
            : `I encountered an error: ${msg}`,
          sources: [],
          evidenceStatus: null,
        },
      ]);
      if (isAiDown) setAiError('Ollama is not reachable. Start it with `ollama serve` and pull your model.');
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AppLayout>
      <div className="page-header-row page-header">
        <div>
          <h1>Ask Questions</h1>
          <p>Query your accessible documents with AI-powered retrieval. Sources are always shown.</p>
        </div>
        {messages.length > 0 && (
          <button
            id="btn-clear-chat"
            className="btn btn-ghost btn-sm"
            onClick={() => { setMessages([]); setAiError(''); }}
          >
            🗑 Clear chat
          </button>
        )}
      </div>

      {/* AI unavailable warning */}
      {aiError && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <span className="alert-icon">⚡</span>
          <span>{aiError}</span>
        </div>
      )}

      <div className="chat-layout">
        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && !thinking && (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3>Start a conversation</h3>
              <p>
                Ask anything about your accessible documents. The AI will retrieve relevant
                passages and show you exactly where each answer comes from.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="btn btn-outline btn-sm"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} userName={user?.name} />
          ))}

          {thinking && <ThinkingBubble />}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="chat-input-bar">
          <div
            className="alert alert-info"
            style={{ marginBottom: '0.75rem', padding: '0.5rem 0.85rem', fontSize: '0.78rem' }}
          >
            <span>🔒</span>
            <span>
              Only documents you are permitted to access will be searched. Quarantined content is
              always excluded.
            </span>
          </div>
          <div className="chat-input-row">
            <textarea
              id="chat-input"
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Ask a question about your documents… (Enter to send, Shift+Enter for newline)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={thinking}
            />
            <button
              id="chat-send-btn"
              className="btn btn-cyan btn-lg"
              onClick={() => sendMessage()}
              disabled={!input.trim() || thinking}
              style={{ height: 52, padding: '0 1.25rem' }}
            >
              {thinking ? <div className="spinner" /> : '↑'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
