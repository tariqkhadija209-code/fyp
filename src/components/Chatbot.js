import React, { useState } from 'react';
import { BASE_URL } from '../components/constant';
const Chatbot = ({ studentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hello! I am Hostelflow Assistant. How can I help you?", isBot: true }]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsgs = [...messages, { text: input, isBot: false }];
    setMessages(newMsgs);
    setInput("");

    try {
      const res = await fetch(`${BASE_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          studentId: studentId
        })
      });
      const data = await res.json();
      setMessages([...newMsgs, { text: data.reply, isBot: true }]);
    } catch (e) {
      setMessages([...newMsgs, { text: "Backend is inaccessible!", isBot: true }]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {/* 1. Chat Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1c2938', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
      >
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`} style={{ fontSize: '24px' }}></i>
      </button>

      {/* 2. Chat Window */}
      {isOpen && (
        <div style={{ position: 'absolute', bottom: '80px', right: '0', width: '320px', height: '450px', background: 'white', borderRadius: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 5px 25px rgba(0,0,0,0.2)' }}>
          {/* Header */}
          <div style={{ background: '#1c2938', color: 'white', padding: '15px', fontWeight: 'bold' }}>
            HostelFlow AI Helper
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f8f9fa' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.isBot ? 'left' : 'right', marginBottom: '10px' }}>
                <span style={{ padding: '8px 12px', borderRadius: '12px', background: msg.isBot ? '#e9ecef' : '#3498db', color: msg.isBot ? 'black' : 'white', display: 'inline-block', maxWidth: '80%', fontSize: '14px' }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ padding: '10px', borderTop: '1px solid #ddd', display: 'flex' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask Question..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }}
            />
            <button onClick={sendMessage} style={{ border: 'none', background: 'none', color: '#1c2938' }}>
              <i className="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;