import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState("");
  const [hasUsername, setHasUsername] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket.id);
    });

    socket.on("chat history", (history) => {
      console.log("📜 Chat history received:", history);
      setChat(history);
    });

    socket.on("receive message", (msg) => {
      console.log("📥 Message received:", msg);
      setChat((prev) => [...prev, msg]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = () => {
    if (message.trim()) {
      const msgData = {
        id: Date.now(),
        text: message,
        user: username,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      socket.emit("send message", msgData);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setHasUsername(true);
    }
  };

  if (!hasUsername) {
    return (
      <div className="container mt-5">
        <h3 className="text-center mb-4">Enter Your Name to Join Chat</h3>
        <div className="d-flex justify-content-center">
          <input
            className="form-control w-50 me-2"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
          />
          <button className="btn btn-primary" onClick={handleUsernameSubmit}>
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Welcome, {username} 👋</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body" style={{ height: "400px", overflowY: "auto", backgroundColor: "#f8f9fa" }}>
              {chat.map((msg) => (
                <div
                  key={msg.id}
                  className={`d-flex mb-2 ${msg.user === username ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div className={`p-2 rounded ${msg.user === username ? "bg-primary text-white" : "bg-light"}`} style={{ maxWidth: '75%' }}>
                    <div className="fw-bold">{msg.user}</div>
                    <div>{msg.text}</div>
                    <small className="text-muted d-block text-end">{msg.time}</small>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="card-footer d-flex gap-2">
              <input
                type="text"
                className="form-control"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
              />
              <button className="btn btn-success" onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
