import React, { useState, useRef, useEffect } from 'react';
import { chatWithCopilot } from '../utils/gemini';
import { Send, Bot, User, Trash2, HelpCircle, Sparkles } from 'lucide-react';

export default function Copilot({ assessments }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I am your Quantum Sentinel AI Security Copilot. I have analyzed all transactions, login logs, and security telemetry for anomalies. Ask me about any alert, specific account, or a summary of today's cybersecurity events.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      // Create current history representation for the model
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const reply = await chatWithCopilot(query, history, assessments);
      
      setMessages(prev => [...prev, {
        role: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `Error contacting copilot service: ${e.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'ai',
        text: "Copilot session reset. How can I help you analyze the bank security logs?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Convert simple markdown in chatbot bubbles
  const renderMessageText = (text) => {
    let formatted = text;
    
    // Bold matching
    const boldRegex = /\*\*(.*?)\*\*/g;
    formatted = formatted.replace(boldRegex, '<strong>$1</strong>');

    // Headers
    const h3Regex = /^### (.*$)/gim;
    formatted = formatted.replace(h3Regex, '<h4 style="color: var(--accent-cyan); margin-top: 0.5rem; margin-bottom: 0.25rem;">$1</h4>');
    
    // Bullet points
    const bulletRegex = /^\* (.*$)/gim;
    formatted = formatted.replace(bulletRegex, '<li style="margin-left: 1rem; margin-top: 0.25rem;">$1</li>');

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const presets = [
    { label: "Summarize active incidents", query: "Summarize today's security incidents." },
    { label: "Explain TXN-2001", query: "Why was transaction TXN-2001 blocked?" },
    { label: "Check Insider Threat", query: "Explain the insider threat on account USR-101." },
    { label: "Why is TXN-2002 flagged?", query: "Explain the detected attack on TXN-2002." }
  ];

  return (
    <div className="glass-card copilot-container" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
      
      {/* Copilot Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        paddingBottom: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            color: '#070a13',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Quantum Sentinel Copilot <Sparkles size={14} color="var(--accent-cyan)" />
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Groq Llama 3.3-powered banking threat assistant</span>
          </div>
        </div>

        <button 
          onClick={handleClear}
          className="nav-button"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          title="Clear Session"
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {/* Quick Presets bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            disabled={loading}
            style={{
              background: 'rgba(0, 242, 254, 0.05)',
              border: '1px solid rgba(0, 242, 254, 0.15)',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            className="preset-btn"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Window */}
      <div className="copilot-messages" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'rgba(7, 10, 19, 0.4)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.03)',
        marginBottom: '1rem'
      }}>
        {messages.map((m, idx) => (
          <div 
            key={idx}
            className={`message-bubble ${m.role}`}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? 'rgba(79, 172, 254, 0.15)' : 'rgba(22, 30, 49, 0.75)',
              border: m.role === 'user' ? '1px solid rgba(79, 172, 254, 0.3)' : '1px solid var(--border-color)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              maxWidth: '80%',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              {m.role === 'user' ? <User size={10} /> : <Bot size={10} color="var(--accent-cyan)" />}
              <span>{m.role === 'user' ? 'Security Analyst' : 'Sentinel Copilot'}</span>
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>
            <div>{renderMessageText(m.text)}</div>
          </div>
        ))}
        {loading && (
          <div className="message-bubble ai" style={{
            alignSelf: 'flex-start',
            background: 'rgba(22, 30, 49, 0.75)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Bot size={14} className="spin-animation" color="var(--accent-cyan)" />
            <span>Copilot is correlating data with AI reasoning...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ display: 'flex', gap: '0.5rem' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot: 'Explain transaction TXN-2001'..."
          disabled={loading}
          className="cyber-input"
          style={{ flex: 1 }}
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="cyber-button"
          style={{ padding: '0.6rem' }}
        >
          <Send size={16} />
        </button>
      </form>

      <style>{`
        .preset-btn:hover {
          background: rgba(0, 242, 254, 0.15) !important;
          border-color: var(--accent-cyan) !important;
        }
      `}</style>

    </div>
  );
}
