import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaRobot } from "react-icons/fa";
import { Link } from "react-router-dom";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import DashboardLayout from "../components/dashboard/DashboardLayout";

const ChatBotUI = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! Ready to practice your conversation skills?" },
  ]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [xp, setXp] = useState(0);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsBotTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const botReply = { from: "bot", text: "💬 Nice! Let’s continue practicing." };
      setMessages((prev) => [...prev, botReply]);
      setIsBotTyping(false);
      setXp((prev) => prev + 5); // XP for each message
    }, 1000);
  };

  return (
    <DashboardLayout>
        <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-amber text-white px-4 py-3 shadow">
        <Link to="/lessons">
          <FaArrowLeft className="text-2xl cursor-pointer" />
        </Link>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaRobot /> Lingo Bot
        </h2>
        <p className="text-sm font-semibold">XP: {xp}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.from === "bot" && (
              <img src={mascot} alt="Bot" className="w-8 h-8 rounded-full mr-2" />
            )}
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${
                msg.from === "user"
                  ? "bg-amber text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Bot Typing */}
        {isBotTyping && (
          <div className="flex items-center">
            <img src={mascot} alt="Bot" className="w-8 h-8 rounded-full mr-2" />
            <div className="px-3 py-1 bg-white rounded-2xl border text-gray-500 text-sm">
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex gap-2">
        <input
          type="text"
          placeholder="Say something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-full focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-amber text-white px-6 py-2 rounded-full font-semibold"
        >
          Send
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default ChatBotUI;
