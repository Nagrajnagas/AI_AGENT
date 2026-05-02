import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const App = () => {
  const API_URL = (
    import.meta.env.VITE_API_URL || 'https://ai-agent-14.onrender.com'
  ).replace(/\/+$/, '');

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
    if (!text) return;

    let index = 0;
    setMessages((prev) => [
      ...prev,
      { role: 'ai', text: '', time: getTime() },
    ]);

    const interval = setInterval(() => {
      index += 1;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = text.slice(0, index);
        return updated;
      });

      if (index >= text.length) clearInterval(interval);
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
      const response = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      console.log('API:', data);

      if (!response.ok || !data || (!data.response && !data.type)) {
        typeMessage(data?.response || 'Server error. Check backend.');
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
      console.error('API connection failed:', err);
      typeMessage('Connection failed. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.start();

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="gif-bg" />

      <main className="app-shell">
        <section className="chat-window" aria-label="AI chat">
          <div className="chat-content">
            {messages.map((msg, index) => {
              if (msg.role === 'weather') {
                return (
                  <div className="message-row ai" key={index}>
                    <div className="weather-card">
                      <div>
                        <span className="weather-label">Weather</span>
                        <h2>{msg.data.city}</h2>
                      </div>
                      <div className="weather-temp">{msg.data.temp}&deg;C</div>
                      <div className="weather-grid">
                        <span>{msg.data.description}</span>
                        <span>Humidity {msg.data.humidity}%</span>
                        <span>Wind {msg.data.wind} m/s</span>
                      </div>
                      <div className="message-time weather-time">{msg.time}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div className={`message-row ${msg.role}`} key={index}>
                  <article className="bubble">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                    <div className="message-time">{msg.time}</div>
                  </article>
                </div>
              );
            })}

            {isLoading && (
              <div className="message-row ai">
                <div className="typing-bubble" aria-label="AI is typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </section>

        <footer className="input-area">
          <div className="input-wrapper">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              aria-label="Message"
            />
            <button
              className="icon-button"
              type="button"
              onClick={startListening}
              aria-label="Use voice input"
              title="Voice input"
            >
              🎙️
            </button>
            <button
              className="send-button"
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              title="Send"
            >
              👉
            </button>
          </div>
        </footer>
      </main>
    </>
  );
};

export default App;
