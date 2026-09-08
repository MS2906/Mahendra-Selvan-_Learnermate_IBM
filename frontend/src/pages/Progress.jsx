import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ProgressBar from "../components/ProgressBar";

function TopicRow({ topic, onComplete, showComplete }) {
  const statusIcon = {
    completed: <span style={{ color: "var(--success)", fontSize: "0.95rem", fontWeight: 700 }}>✓</span>,
    current:   <span style={{ color: "var(--accent)",  fontSize: "0.85rem" }}>●</span>,
    pending:   <span style={{ color: "var(--muted2)",  fontSize: "0.75rem" }}>○</span>,
  };
  return (
    <div
      className="flex items-center gap-12"
      style={{
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
        opacity: topic.status === "pending" ? 0.65 : 1,
      }}
    >
      {statusIcon[topic.status]}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="text-sm font-600 truncate"
          style={{
            textDecoration: topic.status === "completed" ? "line-through" : "none",
            color: topic.status === "completed" ? "var(--muted)" : "var(--text)"
          }}
        >
          {topic.title}
        </div>
        <div className="text-xs text-muted">{topic.phaseName}</div>
      </div>
      <span className="badge badge-muted" style={{ flexShrink: 0 }}>{topic.durationDays}d</span>
      {showComplete && (
        <button className="btn btn-success btn-sm" onClick={() => onComplete(topic.id)}>
          ✓ Complete
        </button>
      )}
      {topic.status === "completed" && (
        <span className="badge badge-success" style={{ flexShrink: 0 }}>Done</span>
      )}
    </div>
  );
}

export default function Progress() {
  const { profile, roadmap, progress, analysis, completeTopic } = useApp();
  const navigate = useNavigate();

  if (!roadmap) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title">Progress Dashboard</div>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No Progress Data Available</div>
            <p className="empty-sub">Complete your student profile to start tracking your personalized course progress.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/profile")}>
              Setup Profile →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allTopics = roadmap.phases?.flatMap((p) =>
    p.topics.map((t) => ({ ...t, phaseName: p.title }))
  ) ?? [];

  const phaseStats = roadmap.phases?.map((p) => {
    const total = p.topics.length;
    const done  = p.topics.filter((t) => t.status === "completed").length;
    return { ...p, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }) ?? [];

  const completedList = allTopics.filter((t) => t.status === "completed");
  const currentList   = allTopics.filter((t) => t.status === "current");
  const pendingList   = allTopics.filter((t) => t.status === "pending");

  // Remaining days estimate calculation
  const remainingDays = pendingList.reduce((s, t) => s + (t.durationDays || 0), 0) +
    currentList.reduce((s, t) => s + (t.durationDays || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Progress Tracker</div>
            <div className="page-sub">
              Student: <strong style={{ color: "var(--text)" }}>{profile.name}</strong> · Goal: {profile.careerGoal}
            </div>
          </div>
          <div className="granite-badge">
            <div className="granite-dot" /> Real-time state
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid-4 gap-16 mb-24">
        <div className="card card-sm stat-card stat-card-accent">
          <div className="stat-value">{progress.overall}%</div>
          <div className="stat-label">Pathway Complete</div>
        </div>
        <div className="card card-sm stat-card stat-card-success">
          <div className="stat-value" style={{ color: "var(--success)" }}>{completedList.length}</div>
          <div className="stat-label">Topics Done</div>
          <div className="stat-sub">{allTopics.length} total topics</div>
        </div>
        <div className="card card-sm stat-card stat-card-warning">
          <div className="stat-value" style={{ color: "var(--warning)" }}>{currentList.length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="card card-sm stat-card stat-card-purple">
          <div className="stat-value" style={{ color: "var(--purple)" }}>{pendingList.length}</div>
          <div className="stat-label">Topics Remaining</div>
          <div className="stat-sub">~{remainingDays} days left</div>
        </div>
      </div>

      {/* Main Overall Progress Visualizer */}
      <div className="card mb-20">
        <div className="progress-label-row">
          <span className="card-title" style={{ marginBottom: 0 }}>Overall Learning Milestone</span>
          <span className="text-muted text-sm font-600">
            {completedList.length} of {allTopics.length} topics complete · Est. {analysis?.estimatedWeeks ?? "—"} total weeks
          </span>
        </div>
        <ProgressBar
          value={progress.overall}
          color={progress.overall === 100 ? "success" : "accent"}
          height={16}
          showLabel
        />
        {progress.overall === 100 && (
          <div className="alert alert-success mt-16" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: "1.2rem" }}>🎉</span>
            <div>
              <div style={{ fontWeight: 700 }}>Roadmap Completed!</div>
              <div>You've successfully mastered all topics in your personalized IBM Granite learning path.</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid-2 gap-20">
        {/* Phase Breakdown */}
        <div className="card">
          <div className="card-title">
            <div className="card-icon card-icon-accent">📋</div>
            Phase Progress Breakdown
          </div>
          <hr className="card-divider" />
          <div className="flex flex-col gap-18">
            {phaseStats.map((p) => (
              <div key={p.id || p.title}>
                <div className="progress-label-row">
                  <span className="text-sm font-700">{p.title}</span>
                  <span className="text-xs text-muted font-600">{p.done}/{p.total} topics</span>
                </div>
                <ProgressBar
                  value={p.pct}
                  color={p.pct === 100 ? "success" : p.done > 0 ? "accent" : "muted"}
                  height={8}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gaps Status */}
        {analysis?.skillGaps?.length > 0 && (
          <div className="card">
            <div className="card-title">
              <div className="card-icon card-icon-warning">🎯</div>
              Target Skill Gaps Identified
            </div>
            <hr className="card-divider" />
            <div className="flex flex-col gap-10">
              {analysis.skillGaps.map((gap, i) => (
                <div key={gap} className="flex items-center gap-12">
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: "var(--warning-dim)", border: "1px solid var(--warning)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.72rem", fontWeight: 700, color: "var(--warning)",
                  }}>
                    {i + 1}
                  </div>
                  <span className="text-sm font-600" style={{ color: "var(--text)" }}>{gap}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Topics List */}
      <div className="card mt-20">
        <div className="card-title">
          <div className="card-icon card-icon-success">📚</div>
          All Course Pathway Topics
        </div>

        {currentList.length > 0 && (
          <div className="mt-16 mb-6">
            <div className="section-label">▶ Active Topics (In Progress)</div>
            {currentList.map((t) => (
              <TopicRow key={t.id} topic={t} onComplete={completeTopic} showComplete />
            ))}
          </div>
        )}

        {completedList.length > 0 && (
          <div className="mt-16 mb-6">
            <div className="section-label">✓ Mastered Topics (Completed)</div>
            {completedList.map((t) => (
              <TopicRow key={t.id} topic={t} />
            ))}
          </div>
        )}

        {pendingList.length > 0 && (
          <div className="mt-16">
            <div className="section-label">○ Upcoming Topics</div>
            {pendingList.map((t) => (
              <TopicRow key={t.id} topic={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
