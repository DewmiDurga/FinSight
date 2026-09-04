import { useState, useRef, useEffect } from "react";
import { api } from "../services/api";

interface Message {
  role: "user" | "assistant";
  text: string;
  time: string;
}

const defaultSuggestions = [
  "How much did I spend this month?",
  "Am I over budget?",
  "What's my savings rate?",
  "Which category costs me most?",
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "👋 Hi! I'm your FinSight AI assistant, directly connected to your financial backend.\n\nAsk me about your spending, budgets, goals, or loans, and I'll analyze your live figures!",
      time: getTime(),
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await api.sendChatMessage(text);
      const assistantMsg: Message = {
        role: "assistant",
        text: reply.text,
        time: reply.timestamp || getTime(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (reply.suggestions && reply.suggestions.length > 0) {
        setSuggestions(reply.suggestions);
      }
    } catch (err) {
      console.error("Failed to get assistant response:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I encountered a problem analyzing your ledger. Please make sure the backend is running.",
          time: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <main className="page-content" style={{ display: "flex", flexDirection: "column" }}>
      <div className="page-header">
        <div className="page-header-text">
          <h1>AI Assistant</h1>
          <p>Real-time financial intelligence powered by your live data</p>
        </div>
        <span className="badge badge-purple">🤖 Live Backend</span>
      </div>

      {/* Quick suggestions */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        {suggestions.map((s) => (
          <button key={s} className="btn btn-ghost btn-sm" onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="chat-window" style={{ flex: 1 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble-wrap ${msg.role}`}>
            <div className={`chat-avatar ${msg.role === "assistant" ? "bot" : "user"}`}>
              {msg.role === "assistant" ? "🤖" : "👤"}
            </div>
            <div>
              <div className={`chat-bubble ${msg.role}`}>
                {msg.text.split("\n").map((line, j) => (
                  <span key={j}>{line}<br /></span>
                ))}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", textAlign: msg.role === "user" ? "right" : "left" }}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-wrap assistant">
            <div className="chat-avatar bot">🤖</div>
            <div className="chat-bubble assistant" style={{ color: "#94a3b8", fontStyle: "italic" }}>
              Analyzing your finances…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask about your spending, budgets, loans, or goals…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={!input.trim() || loading}>
          Send ➤
        </button>
      </form>
    </main>
  );
}

export default Assistant;
