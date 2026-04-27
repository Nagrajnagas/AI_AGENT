import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Lottie from "lottie-react";
// import bgAnimation from "./assets/bg-animation.mp4";
// import bgGif from "./assets/b1.gif";


const App = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://ai-agent-14.onrender.com/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.type === "weather") {
        setMessages(prev => [
          ...prev,
          { role: "weather", data: data.data },
          { role: "ai", text: data.summary }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "ai", text: data.response }
        ]);
      }

    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: '⚠️ Connection failed.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <>
      {/* 🎥 BACKGROUND VIDEO
  <video autoPlay loop muted playsInline style={styles.videoBg}>
    <source src={bgAnimation} type="video/mp4" />
  </video>

  {/* 🌑 OVERLAY 
  <div style={styles.overlay}></div>*/}

      <div style={styles.gifBg}></div>
      <div style={styles.overlay}></div>

      <div style={styles.app}>
        {/* CHAT AREA */}
        <div style={styles.chatWindow}>
          <div style={styles.chatContent}>

            {messages.map((msg, index) => {

              // 🌦 WEATHER CARD
              if (msg.role === "weather") {
                return (
                  <div key={index} style={styles.weatherCard}>
                    <h3>📍 {msg.data.city}</h3>
                    <h1>{msg.data.temp}°C</h1>
                    <p>{msg.data.description}</p>
                    <p>💧 {msg.data.humidity}% | 🌬 {msg.data.wind} m/s</p>
                  </div>
                );
              }

              // 💬 NORMAL CHAT
              return (
                <div
                  key={index}
                  style={{
                    ...styles.messageRow,
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    ...styles.bubble,
                    backgroundColor: msg.role === 'user' ? '#2563eb' : '#2f2f2f'
                  }}>
                    <ReactMarkdown>
                      {typeof msg.text === "string" ? msg.text : ""}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div style={styles.messageRow}>
                <div style={styles.bubble}>Typing...</div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </div>

        {/* INPUT */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(e);
          }}
          style={styles.inputArea}
        >
          <div style={styles.inputWrapper}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={styles.input}
            />

            <div
              onClick={() => {
                if (!input.trim() || isLoading) return;
                handleSend({ preventDefault: () => { } });
              }}
              style={styles.lottieButton}
            >
              <dotlottie-player
                src="https://lottie.host/8ae67815-fb6d-46de-a19d-b562165f9853/sfshT3sIYl.lottie"
                autoplay
                loop
                style={{ width: "35px", height: "35px" }}
              ></dotlottie-player>
            </div>
          </div>


        </form>

      </div>
    </>
  );
};

const styles = {
  app: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, sans-serif',
    position: "relative",
    zIndex: 1
  },

  chatWindow: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
    padding: '20px'
  },

  chatContent: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  messageRow: {
    display: 'flex',
    width: '100%'
  },

  bubble: {
    padding: '12px 16px',
    borderRadius: '12px',
    maxWidth: '70%',
    lineHeight: '1.5'
  },

  inputArea: {
    padding: '16px',
    borderTop: '1px solid #333',
    display: 'flex',
    justifyContent: 'center'
  },

  inputBox: {
    display: 'flex',
    width: '100%',
    maxWidth: '800px',
    gap: '10px'
  },

  inputWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "800px"
  },
  input: {
    width: "100%",
    padding: "12px 45px 12px 12px",
    borderRadius: "10px",
    border: "none",
    background: "#2f2f2f",
    color: "white",
    outline: "none"
  },

  lottieButton: {
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translate(150%, -50%)",
    cursor: "pointer",
    color: "white",
    opacity: 0.90
  },

  weatherCard: {
    background: "#2f2f2f",
    borderRadius: "12px",
    padding: "20px"
  },

  background: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    opacity: 0.15,   // 🔥 make it subtle
    pointerEvents: "none" // 🔥 allows clicking UI
  },

  videoBg: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    objectFit: "cover",
    zIndex: -2,
    opacity: 0.99
  },

  gifBg: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
      backgroundImage: "url('/b1.gif')",
    backgroundSize: "cover",     // 🔥 full screen
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: -2,
    opacity: 0.99,
  },
};

export default App;