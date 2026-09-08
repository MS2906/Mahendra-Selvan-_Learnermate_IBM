import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";

const EDUCATION_LEVELS = ["high school", "undergraduate", "graduate", "self-taught", "professional"];
const SKILL_LEVELS     = ["beginner", "intermediate", "advanced"];

const STEP_LABELS = {
  analyzing:  "IBM Granite is analyzing your profile & skill gaps…",
  roadmapping:"Generating personalized learning roadmap with Granite 4 H…",
  done:       "✅ Roadmap ready! Redirecting to your path…",
};

export default function Profile() {
  const { profile, setProfile, setAnalysis, updateRoadmap } = useApp();
  const navigate = useNavigate();

  const [form, setForm]           = useState(profile);
  const [skillInput, setSkillInput]   = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [step, setStep]           = useState("idle");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addTag = (field, input, setInput) => {
    const val = input.trim();
    if (!val) return;
    if (!form[field].includes(val)) set(field, [...form[field], val]);
    setInput("");
  };
  const removeTag = (field, val) => set(field, form[field].filter((v) => v !== val));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.careerGoal.trim()) {
      setError("Full Name and Career Goal are required fields.");
      return;
    }
    setError("");
    setLoading(true);
    setStep("analyzing");
    try {
      // 1. IBM Granite Skill Analysis
      const analysisResult = await api.analyze(form);
      setAnalysis(analysisResult);
      setProfile(form);

      // 2. IBM Granite Roadmap Generation
      setStep("roadmapping");
      const roadmapResult = await api.roadmap(form, analysisResult);
      updateRoadmap(roadmapResult);

      setStep("done");
      setTimeout(() => navigate("/roadmap"), 900);
    } catch (err) {
      setError(`IBM Granite API Error: ${err.message}`);
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Student Profile</div>
            <div className="page-sub">Configure your background and career goal for IBM Granite AI analysis</div>
          </div>
          <div className="granite-badge">
            <div className="granite-dot" /> IBM Granite 4 H
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <span style={{ fontSize: "1.1rem" }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700 }}>Submission Failed</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {loading && step !== "idle" && (
        <div className="alert alert-info">
          <span className="spinner" style={{ width: 20, height: 20 }} />
          <div>
            <div style={{ fontWeight: 700 }}>AI Processing Active</div>
            <div>{STEP_LABELS[step]}</div>
          </div>
        </div>
      )}

      {/* Progress Multi-step Bar during submission */}
      {loading && (
        <div className="card mb-24 card-accent">
          <div className="flex items-center gap-16" style={{ padding: "4px 0" }}>
            {["Skill Analysis", "Roadmap Generation", "Complete"].map((label, i) => {
              const done = (step === "roadmapping" && i === 0) || (step === "done" && i <= 1);
              const active = (step === "analyzing" && i === 0) || (step === "roadmapping" && i === 1) || (step === "done" && i === 2);
              return (
                <div key={label} className="flex items-center gap-10" style={{ flex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 700,
                    background: done ? "var(--success)" : active ? "var(--accent)" : "var(--surface3)",
                    color: done || active ? "#fff" : "var(--muted)",
                    boxShadow: active ? "0 0 12px var(--accent)" : "none",
                    transition: "all 0.3s ease",
                  }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className="text-sm font-600" style={{ color: active ? "var(--accent2)" : done ? "var(--success)" : "var(--muted)" }}>
                    {label}
                  </span>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: done ? "var(--success)" : "var(--border2)" }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-2 gap-24">
          {/* Left Column — Personal & Goal */}
          <div>
            <div className="card mb-20">
              <div className="card-title">
                <div className="card-icon card-icon-accent">👤</div>
                Personal Details &amp; Target Goal
              </div>
              <div className="card-sub">Core profile inputs used to align your AI curriculum</div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Career Goal *</label>
                <input
                  className="form-input"
                  value={form.careerGoal}
                  onChange={(e) => set("careerGoal", e.target.value)}
                  placeholder="e.g. Full-Stack AI Developer, Data Scientist, DevOps Engineer"
                  required
                  disabled={loading}
                />
                <div className="form-hint">Be specific so Granite can recommend precise technologies.</div>
              </div>

              <div className="form-group">
                <label className="form-label">Education Level</label>
                <select
                  className="form-select"
                  value={form.educationLevel}
                  onChange={(e) => set("educationLevel", e.target.value)}
                  disabled={loading}
                >
                  {EDUCATION_LEVELS.map((l) => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Skill Level</label>
                <div className="flex gap-8">
                  {SKILL_LEVELS.map((l) => (
                    <button
                      key={l} type="button"
                      className={`btn btn-sm ${form.currentSkillLevel === l ? "btn-primary" : "btn-secondary"}`}
                      style={{ flex: 1, textTransform: "capitalize" }}
                      onClick={() => set("currentSkillLevel", l)}
                      disabled={loading}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Daily Study Commitment</label>
                <div className="flex items-center gap-12">
                  <input
                    className="form-input"
                    type="number" min="0.5" max="12" step="0.5"
                    value={form.dailyStudyTime}
                    onChange={(e) => set("dailyStudyTime", parseFloat(e.target.value) || 1)}
                    style={{ maxWidth: 110 }}
                    disabled={loading}
                  />
                  <span className="text-muted text-sm font-600">hours per day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Skills & Interests */}
          <div>
            <div className="card mb-20">
              <div className="card-title">
                <div className="card-icon card-icon-purple">🎯</div>
                Current Skills &amp; Domain Interests
              </div>
              <div className="card-sub">Type each skill/interest and press Enter or click Add</div>

              <div className="form-group">
                <label className="form-label">Existing Skills</label>
                {form.currentSkills.length > 0 && (
                  <div className="tags-input mb-10">
                    {form.currentSkills.map((s) => (
                      <span key={s} className="tag">
                        {s}
                        <span className="tag-remove" onClick={() => !loading && removeTag("currentSkills", s)} title="Remove skill">×</span>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-8">
                  <input
                    className="form-input"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("currentSkills", skillInput, setSkillInput))}
                    placeholder="e.g. HTML, JavaScript, Python, Git…"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => addTag("currentSkills", skillInput, setSkillInput)}
                    disabled={loading || !skillInput.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Interests &amp; Focus Areas</label>
                {form.interests.length > 0 && (
                  <div className="tags-input mb-10">
                    {form.interests.map((s) => (
                      <span key={s} className="tag">
                        {s}
                        <span className="tag-remove" onClick={() => !loading && removeTag("interests", s)} title="Remove interest">×</span>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-8">
                  <input
                    className="form-input"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("interests", interestInput, setInterestInput))}
                    placeholder="e.g. Artificial Intelligence, Cloud, Web Apps…"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => addTag("interests", interestInput, setInterestInput)}
                    disabled={loading || !interestInput.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 18, height: 18 }} /> {STEP_LABELS[step] || "Processing with IBM Granite…"}</>
                : "🚀 Analyze Profile &amp; Generate Roadmap with IBM Granite"}
            </button>

            <div className="text-muted text-xs mt-12" style={{ textAlign: "center" }}>
              Uses IBM Granite 4 H Small via IBM watsonx.ai (Dallas / us-south)
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
