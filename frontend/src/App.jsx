import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'System initialized. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      // Add AI response to UI
      setMessages((prev) => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Error: Could not connect to the agent.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.statusDot}></div>
        <span style={styles.headerTitle}>AI_AGENT</span>
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
              backgroundColor: msg.role === 'user' ? '#005fcc' : '#2d2d2d',
              borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
              borderBottomLeftRadius: msg.role === 'ai' ? '2px' : '12px',
            }}>
              <div style={styles.roleLabel}>{msg.role.toUpperCase()}</div>
              <div style={styles.text}>{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={styles.messageWrapper}>
            <div style={{...styles.bubble, backgroundColor: '#2d2d2d'}}>
              <span className="typing-dots">Processing...</span>
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
          placeholder="Enter command or message..."
          style={styles.input}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          style={{
            ...styles.button,
            opacity: isLoading || !input.trim() ? 0.5 : 1
          }}
          disabled={isLoading}
        >
          EXECUTE
        </button>
      </form>
    </div>
  );
};

// Inline Styles for a "Terminal" aesthetic
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#0f0f0f',
    color: '#00ff41', // Classic Matrix/Terminal green
    fontFamily: '"Courier New", Courier, monospace',
  },
  header: {
    padding: '15px 20px',
    backgroundColor: '#1a1a1a',
    borderBottom: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#00ff41',
    borderRadius: '50%',
    boxShadow: '0 0 5px #00ff41',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  chatWindow: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    padding: '12px 16px',
    maxWidth: '80%',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  roleLabel: {
    fontSize: '10px',
    marginBottom: '5px',
    opacity: 0.7,
    fontWeight: 'bold',
  },
  text: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#ffffff',
  },
  inputArea: {
    padding: '20px',
    display: 'flex',
    gap: '10px',
    backgroundColor: '#1a1a1a',
    borderTop: '1px solid #333',
  },
  input: {
    flex: 1,
    backgroundColor: '#000',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    padding: '12px',
    color: '#00ff41',
    outline: 'none',
  },
  button: {
    backgroundColor: '#00ff41',
    color: '#000',
    border: 'none',
    padding: '0 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default App;