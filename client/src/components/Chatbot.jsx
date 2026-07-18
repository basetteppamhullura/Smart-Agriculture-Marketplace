import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Leaf, HelpCircle } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste! I am your Smart Farming AI Assistant. How can I help you with crop recommendation, pest remedies, market prices, or government schemes today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'Organic Pest Control',
    'Subsidies & Insurance',
    'Crop Yield Guide',
    'Weather Safety Tips'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.response || 'Sorry, I am facing connectivity issues.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error contacting AI engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} style={styles.trigger} className="pulse-glow">
          <MessageSquare size={24} color="white" />
          <span style={styles.tooltip}>Farming Chatbot</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow} className="glass-card">
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.titleInfo}>
              <Leaf size={18} color="#10b981" />
              <span style={styles.titleText}>AgriChat AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              <X size={16} color="var(--text-secondary)" />
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messageBox}>
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                style={{
                  ...styles.messageRow,
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: m.sender === 'user' ? 'var(--forest-green)' : 'var(--bg-primary)',
                    color: m.sender === 'user' ? 'white' : 'var(--text-primary)',
                    borderRadius: m.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={styles.messageRow}>
                <div style={{ ...styles.messageBubble, backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={styles.quickArea}>
            {quickPrompts.map((qp, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSend(qp)} 
                style={styles.chip}
              >
                <HelpCircle size={10} />
                <span>{qp}</span>
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            style={styles.inputArea}
          >
            <input
              type="text"
              placeholder="Ask anything..."
              style={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" style={styles.sendBtn}>
              <Send size={16} color="white" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '25px',
    right: '25px',
    zIndex: 1000
  },
  trigger: {
    width: '60px',
    height: '60px',
    borderRadius: '50px',
    backgroundColor: 'var(--forest-green)',
    border: 'none',
    boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'transform 0.2s'
  },
  tooltip: {
    position: 'absolute',
    left: '-130px',
    top: '18px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)'
  },
  chatWindow: {
    width: '350px',
    height: '460px',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)'
  },
  titleInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  titleText: {
    fontWeight: '700',
    fontSize: '15px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  messageBox: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: 'var(--bg-secondary)'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    fontSize: '13px',
    lineHeight: '1.4',
    boxShadow: 'var(--shadow-sm)'
  },
  quickArea: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    padding: '10px 16px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)'
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    fontSize: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  inputArea: {
    display: 'flex',
    padding: '12px 16px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    alignItems: 'center',
    gap: '8px'
  },
  chatInput: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none'
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50px',
    backgroundColor: 'var(--forest-green)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }
};
