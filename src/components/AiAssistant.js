import React, { useState, useRef, useEffect } from "react";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm Flora, your smart plant care assistant 🌿 How can I help today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  // 🔄 التمرير التلقائي لآخر رسالة
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 🧠 وظيفة الذكاء الاصطناعي البسيطة (ردود مبدئية)
  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();

if (input.includes("disease") || input.includes("مرض")) {
  return "You can upload a picture of the plant leaf to the Disease Detection system, and I’ll tell you whether the plant is healthy or sick 🌱";
} else if (input.includes("crop") || input.includes("محصول")) {
  return "The Crop Recommendation system helps you choose the most suitable crops based on soil and climate conditions 🌾";
} else if (input.includes("team") || input.includes("فريق")) {
  return "Flora was developed by a talented team of four students: Mai Mohamed, Shahd Hesham, Nour Hossam, and Selvia Nasser 💚";
} else if (input.includes("how") || input.includes("كيف")) {
  return "Flora uses advanced AI models to analyze plant images and agricultural data 🤖";
} else {
  return "I'm here to assist you with anything related to plants 🌿 Try asking about 'plant disease' or 'crop recommendation'.";
}}

  // 🚀 إرسال الرسالة
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <section className="ai-assistant" id="ai">
      <div className="container">
        <div className="ai-content">
          <h2>Ask Flora AI 🌿</h2>
          <p>Have a question about your plants? Flora's smart assistant is here to help.</p>

          <div className="chat-box">
            <div className="chat-messages" ref={scrollRef}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.sender === "user" ? "user-message" : "ai-message"}`}
                >
                  <p>{msg.text}</p>
                  <span className="timestamp">
                    {msg.timestamp.toLocaleTimeString("EG", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Write your question about plants..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button onClick={handleSendMessage}>send</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiAssistant;
