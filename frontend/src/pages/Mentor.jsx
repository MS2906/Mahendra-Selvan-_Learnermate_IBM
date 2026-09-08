import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";

const SUGGESTIONS = [
  "What should I study today?",
  "I'm struggling with JavaScript. What should I practice?",
  "Explain my current roadmap.",
  "How can I improve my skills?",
];

export default function Mentor() {
  const { profile, analysis, roadmap, progress, chatHistory, addMessage } = useApp();
  const navigate  = useNavigate();
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  /* ── Profile empty state ── */
  if (!profile.name) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title">AI Mentor</div>
          <div className="page-sub">Your personal IBM Granite learning assistant</div>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <div className="empty-title">Setup Student Profile First</div>
            <p className="empty-sub">
              Create your student profile so LearnMate can personalize its mentoring
              to your exact skills, goals, and active roadmap.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/profile")}>
              Setup Profile →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    addMessage("user", text);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const { reply } = await api.mentor(profile, analysis, roadmap, progress, [
        ...chatHistory,
        { role: "user", content: text },
      ]);
      addMessage("assistant", reply);
    } catch (err) {
      setError(`IBM Granite Error: ${err.message}`);
      addMessage("assistant", "Sorry, I encountered an issue connecting to IBM Granite right now. Please try sending your message again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSuggestions = chatHistory.length <= 1;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">AI Mentor</div>
            <div className="page-sub">
              Powered by IBM Granite 4 H Small via watsonx.ai · Personalized to {profile.name}
            </div>
          </div>
          <div className="granite-badge">
            <div className="granite-dot" /> Granite 4 H Small
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert alert-error mb-16">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Suggestion Chips */}
      {showSuggestions && (
        <div>
          <div className="text-xs font-700 text-muted uppercase mb-8" style={{ letterSpacing: "0.05em" }}>
            Suggested Questions for Granite AI
          </div>
          <div className="suggestions-row">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="suggestion-chip"
                onClick={() => setInput(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Layout Container */}
      <div className="chat-layout">
        {/* Messages List */}
        <div className="chat-messages">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`chat-msg-wrap ${msg.role}`}>
              <div className="chat-msg-label">
                {msg.role === "assistant" ? (
                  <>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--accent), var(--accent-purple))",
                      display: "inline-flex", alignItems: "center",
                      justifyContent: "center", fontSize: "0.6rem", color: "#fff",
                      flexShrink: 0, boxShadow: "0 2px 8px rgba(59,130,246,0.3)"
                    }}>✨</span>
                    LearnMate AI (IBM Granite)
                  </>
                ) : (
                  <>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "var(--accent)",
                      display: "inline-flex", alignItems: "center",
                      justifyContent: "center", fontSize: "0.65rem", color: "#fff",
                      fontWeight: 700, flexShrink: 0,
                    }}>
                      {profile.name[0]?.toUpperCase()}
                    </span>
                    You ({profile.name})
                  </>
                )}
              </div>
              <div className={`chat-message ${msg.role}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="chat-msg-wrap assistant">
              <div className="chat-msg-label">
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--accent-purple))",
                  display: "inline-flex", alignItems: "center",
                  justifyContent: "center", fontSize: "0.6rem", color: "#fff",
                  flexShrink: 0,
                }}>✨</span>
                LearnMate AI
              </div>
              <div className="chat-message assistant typing">
                <span className="chat-typing-dots">
                  <span /><span /><span />
                </span>
                {" "}IBM Granite is thinking…
              </div>
            </div>
          )}

          {/* Empty Chat state hint */}
          {chatHistory.length === 1 && !loading && (
            <div style={{ textAlign: "center", padding: "36px 16px", color: "var(--muted)" }}>
              <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>✨</div>
              <div className="text-sm font-500">
                Ask me anything about your roadmap, active topics, or career goal!
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Form Area */}
        <div className="chat-input-area">
          <form className="chat-input-row" onSubmit={handleSend}>
            <textarea
              className="chat-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask LearnMate AI anything… (Enter to send, Shift+Enter for new line)"
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
              style={{ alignSelf: "flex-end", height: 48, minWidth: 90 }}
            >
              {loading
                ? <span className="spinner" style={{ width: 18, height: 18 }} />
                : "Send ↑"}
            </button>
          </form>
          <div className="text-xs text-muted mt-8" style={{ textAlign: "center" }}>
            IBM Granite 4 H Small via watsonx.ai · Context tuned to {profile.careerGoal || "your goals"}
          </div>
        </div>
      </div>
    </div>
  );
}
