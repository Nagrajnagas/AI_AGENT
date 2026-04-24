import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '### System Initialized\nSecure connection established. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // UPDATED TO YOUR LIVE RENDER URL
      const response = await fetch('https://ai-agent-14.onrender.com/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error('System Timeout or Network Error');

      const data = await response.json();
      
      // Add AI response to UI
      setMessages((prev) => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        role: 'ai', 
        text: '⚠️ **CRITICAL_ERROR:** Connection to the remote agent failed. Ensure the backend is live.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.statusDot}></div>
        <div style={styles.headerText}>
            <span style={styles.headerTitle}>AI_AGENT_V1.0</span>
            <span style={styles.headerSubtitle}>LOCATION: BENGALURU_HUB</span>
        </div>
      </div>

      {/* Chat Window */}
      <div style={styles.chatWindow}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{
              ...styles.messageWrapper,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              ...styles.bubble,
              backgroundColor: msg.role === 'user' ? '#0047ab' : '#1e1e1e',
              borderLeft: msg.role === 'ai' ? '2px solid #00ff41' : 'none',
              borderRight: msg.role === 'user' ? '2px solid #ffffff' : 'none',
            }}>
              <div style={{
                  ...styles.roleLabel, 
                  color: msg.role === 'user' ? '#80b3ff' : '#00ff41'
              }}>
                [{msg.role.toUpperCase()}_SESSION]
              </div>
              <div style={styles.text}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={styles.messageWrapper}>
            <div style={{...styles.bubble, backgroundColor: '#1e1e1e', borderLeft: '2px solid #f1c40f'}}>
              <div style={{...styles.roleLabel, color: '#f1c40f'}}>[SYSTEM_PROCESSING]</div>
              <div className="blink" style={styles.loaderText}>
                Accessing Groq LPU... (First boot may take 60s)
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TYPE COMMAND HERE..."
          style={styles.input}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          style={{
            ...styles.button,
            backgroundColor: isLoading ? '#333' : '#00ff41',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          disabled={isLoading}
        >
          {isLoading ? '...' : 'EXEC'}
        </button>
      </form>
      
      {/* Global Style for Blinking effect */}
      <style>{`
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .blink { animation: blink 1.5s infinite; }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#e0e0e0',
    fontFamily: '"Cascadia Code", "Courier New", monospace',
  },
  header: {
    padding: '12px 20px',
    backgroundColor: '#111',
    borderBottom: '1px solid #222',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#00ff41',
    borderRadius: '50%',
    boxShadow: '0 0 8px #00ff41',
  },
  headerText: { display: 'flex', flexDirection: 'column' },
  headerTitle: { fontSize: '12px', fontWeight: 'bold', color: '#00ff41' },
  headerSubtitle: { fontSize: '9px', color: '#666' },
  chatWindow: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  messageWrapper: { display: 'flex', width: '100%' },
  bubble: {
    padding: '12px 18px',
    maxWidth: '85%',
    borderRadius: '4px',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
  },
  roleLabel: { fontSize: '9px', marginBottom: '8px', letterSpacing: '1px' },
  text: { fontSize: '14px', lineHeight: '1.6', color: '#ffffff' },
  loaderText: { fontSize: '12px', color: '#f1c40f' },
  inputArea: {
    padding: '15px',
    display: 'flex',
    gap: '10px',
    backgroundColor: '#111',
    borderTop: '1px solid #222',
  },
  input: {
    flex: 1,
    backgroundColor: '#000',
    border: '1px solid #333',
    padding: '12px',
    color: '#00ff41',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    color: '#000',
    border: 'none',
    padding: '0 25px',
    borderRadius: '2px',
    fontWeight: 'bold',
    fontSize: '12px',
    transition: '0.3s',
  },
};

export default App;