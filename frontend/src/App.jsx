import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const App = () => {
  const API_URL = (
    import.meta.env.VITE_API_URL || 'https://ai-agent-14.onrender.com'
  ).replace(/\/+$/, '');

  // ✅ FIXED USER ID (persistent)
  const getUserId = () => {
    const key = 'ai_agent_user_id';
    let id = localStorage.getItem(key);

    if (!id) {
      id = crypto.randomUUID
        ? crypto.randomUUID()
        : `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(key, id);
    }
    return id;
  };

  // ✅ STORE ONCE
  const [userId] = useState(() => getUserId());

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState([
    { role: 'ai', text: 'How can I help you today?', time: getTime() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const typeMessage = (text) => {
    let i = 0;
    setMessages((prev) => [...prev, { role: 'ai', text: '', time: getTime() }]);

    const interval = setInterval(() => {
      i++;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = text.slice(0, i);
        return updated;
      });
      if (i >= text.length) clearInterval(interval);
    }, 12);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userMessage, time: getTime() },
    ]);

    setIsLoading(true);

    try {
      console.log("USER_ID:", userId); // 🔍 debug

      const response = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          user_id: userId, // ✅ FIXED
        }),
      });

      const data = await response.json();

      if (!response.ok || !data) {
        typeMessage('Server error.');
        return;
      }

      if (data.type === 'weather') {
        setMessages((prev) => [
          ...prev,
          { role: 'weather', data: data.data, time: getTime() },
        ]);
      } else {
        typeMessage(data.response || 'No response.');
      }
    } catch (err) {
      typeMessage('Connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      <div className="gif-bg" />

      <main className="app-shell">
        <section className="chat-window">
          <div className="chat-content">
            {messages.map((msg, i) => (
              <div className={`message-row ${msg.role}`} key={i}>
                <div className="bubble">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                  <div className="message-time">{msg.time}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="typing-bubble">
                <span></span><span></span><span></span>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </section>

        <footer className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
          />
          <button onClick={handleSend}>Send</button>
        </footer>
      </main>
    </>
  );
};

export default App;