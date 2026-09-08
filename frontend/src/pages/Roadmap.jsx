import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import ProgressBar from "../components/ProgressBar";

const STATUS_BADGE = {
  completed: <span className="badge badge-success">✓ Completed</span>,
  current:   <span className="badge badge-accent badge-dot">In Progress</span>,
  pending:   <span className="badge badge-muted">Upcoming</span>,
};

export default function Roadmap() {
  const { profile, roadmap, analysis, progress, updateRoadmap, completeTopic } = useApp();
  const navigate = useNavigate();
  const [feedback, setFeedback]         = useState("");
  const [adapting, setAdapting]         = useState(false);
  const [adaptiveResult, setAdaptiveResult] = useState(null);
  const [adaptError, setAdaptError]     = useState("");

  /* ── Empty state ── */
  if (!roadmap) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title">Learning Roadmap</div>
          <div className="page-sub">Your personalized course pathway to {profile.careerGoal || "your career goal"}</div>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <div className="empty-title">No Active Roadmap Found</div>
            <p className="empty-sub">
              Complete your profile so IBM Granite AI can generate a personalized
              step-by-step learning path for you.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/profile")}>
              Setup Profile &amp; Generate Roadmap →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAdaptive = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setAdapting(true);
    setAdaptError("");
    setAdaptiveResult(null);
    try {
      const result = await api.adaptive(profile, analysis, roadmap, feedback, progress);
      setAdaptiveResult(result);
      if (result.insertTopics?.length > 0) {
        const updated = { ...roadmap };
        let inserted = false;
        updated.phases = updated.phases.map((phase) => {
          if (!inserted) {
            const hasPending = phase.topics.some((t) => t.status === "current" || t.status === "pending");
            if (hasPending) {
              inserted = true;
              const newTopics = result.insertTopics.map((t, i) => ({
                ...t, status: i === 0 ? "current" : "pending",
              }));
              return {
                ...phase,
                topics: [
                  ...newTopics,
                  ...phase.topics.map((t) => ({ ...t, status: t.status === "current" ? "pending" : t.status })),
                ],
              };
            }
          }
          return phase;
        });
        updateRoadmap(updated);
      }
      setFeedback("");
    } catch (err) {
      setAdaptError(`Adaptive AI Error: ${err.message}`);
    } finally {
      setAdapting(false);
    }
  };

  const allTopics = roadmap.phases?.flatMap((p) => p.topics) ?? [];
  const completedCount = allTopics.filter((t) => t.status === "completed").length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Personalized Learning Roadmap</div>
            <div className="page-sub">
              Goal: <strong style={{ color: "var(--text)" }}>{profile.careerGoal}</strong>
              {" · "}{roadmap.phases?.length} phases
              {analysis?.estimatedWeeks ? ` · ~${analysis.estimatedWeeks} weeks total` : ""}
            </div>
          </div>
          <div className="flex items-center gap-12">
            <span className="text-muted text-sm font-600">{completedCount} of {allTopics.length} topics done</span>
            <span className="badge badge-accent" style={{ fontSize: "0.82rem" }}>{progress.overall}% Overall</span>
          </div>
        </div>
      </div>

      {/* Overall Progress Banner */}
      <div className="card mb-24">
        <div className="progress-label-row">
          <span className="text-sm font-700">Overall Pathway Completion</span>
          <span className="text-muted text-xs font-600">{completedCount}/{allTopics.length} Topics</span>
        </div>
        <ProgressBar
          value={progress.overall}
          color={progress.overall === 100 ? "success" : "accent"}
          height={12}
        />
      </div>

      {/* Phase Timeline */}
      {roadmap.phases?.map((phase, pi) => {
        const phaseTopicsDone = phase.topics.filter((t) => t.status === "completed").length;
        const phasePct = phase.topics.length ? Math.round((phaseTopicsDone / phase.topics.length) * 100) : 0;
        const allPhaseDone = phasePct === 100;

        return (
          <div
            key={phase.id || `phase-${pi}`}
            className={`roadmap-phase${pi < roadmap.phases.length - 1 ? " phase-line" : ""}`}
          >
            <div className="phase-header">
              <div className={`phase-dot${allPhaseDone ? " phase-dot-done" : ""}`}>
                {allPhaseDone ? "✓" : pi + 1}
              </div>
              <div className="phase-info">
                <div className="phase-title">{phase.title}</div>
                <div className="phase-meta">
                  Duration: {phase.durationWeeks} week{phase.durationWeeks !== 1 ? "s" : ""}
                  {" · "}{phaseTopicsDone} of {phase.topics.length} topics complete
                </div>
              </div>
              <ProgressBar
                value={phasePct}
                color={allPhaseDone ? "success" : "accent"}
                height={6}
                style={{ width: 100, flexShrink: 0 }}
              />
            </div>

            {phase.topics.map((topic) => (
              <div key={topic.id} className={`topic-card status-${topic.status}`}>
                <div className="topic-card-header">
                  <div className={`topic-title${topic.status === "completed" ? " topic-title-completed" : ""}`}>
                    {topic.title}
                  </div>
                  <div className="flex items-center gap-8">
                    {STATUS_BADGE[topic.status]}
                    <span className="badge badge-muted">~{topic.durationDays}d</span>
                  </div>
                </div>
                <div className="topic-desc">{topic.description}</div>
                {topic.resources?.length > 0 && (
                  <div className="topic-resources">
                    {topic.resources.map((r) => <span key={r} className="resource-chip">📖 {r}</span>)}
                  </div>
                )}
                {topic.status === "current" && (
                  <button className="btn btn-success btn-sm mt-4" onClick={() => completeTopic(topic.id)}>
                    ✓ Mark as Completed &amp; Advance
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })}

      {/* Adaptive AI Adjustment Section */}
      <div className="card mt-24 card-accent">
        <div className="card-title">
          <div className="card-icon card-icon-accent">🔄</div>
          Adaptive AI Roadmap Adjuster
        </div>
        <div className="card-sub">
          Struggling with a topic or need extra practice? Tell IBM Granite and it will dynamically insert targeted review topics into your pathway.
        </div>

        {adaptError && (
          <div className="alert alert-error">
            <span>⚠️</span><span>{adaptError}</span>
          </div>
        )}

        <form onSubmit={handleAdaptive}>
          <div className="form-group">
            <label className="form-label">What are you finding challenging?</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='e.g. "I am struggling with JavaScript async/await promises and closure concepts"'
              disabled={adapting}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={adapting || !feedback.trim()}
          >
            {adapting
              ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Adapting Pathway with IBM Granite…</>
              : "⚡ Adapt My Roadmap"}
          </button>
        </form>

        {adaptiveResult && (
          <div className="adaptive-card">
            <div className="adaptive-title">✅ Roadmap Dynamically Adjusted</div>
            <p className="text-sm mb-12" style={{ color: "var(--text)" }}>{adaptiveResult.adjustment}</p>
            {adaptiveResult.motivationalMessage && (
              <div className="adaptive-motivation">
                <div className="text-xs font-700 text-muted uppercase mb-4" style={{ letterSpacing: "0.05em" }}>
                  Granite AI Motivation
                </div>
                <p className="text-sm" style={{ color: "var(--text2)" }}>
                  "{adaptiveResult.motivationalMessage}"
                </p>
              </div>
            )}
            {adaptiveResult.adjustedStrategy && (
              <div className="text-muted text-xs mt-8">
                <strong>Recommended Strategy:</strong> {adaptiveResult.adjustedStrategy}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
