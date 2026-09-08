import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function CircleProgress({ value, size = 96 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="circle-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface2)" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#pg)" strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <defs>
          <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-purple)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="circle-progress-text">
        <div style={{ fontSize: "1.2rem", lineHeight: 1 }}>{value}%</div>
        <div style={{ fontSize: "0.62rem", color: "var(--muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          complete
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, analysis, roadmap, progress } = useApp();
  const navigate = useNavigate();

  const allTopics = roadmap?.phases?.flatMap((p) => p.topics) ?? [];
  const currentTopic = allTopics.find((t) => t.status === "current");
  const nextTopic = allTopics.find((t) => t.status === "pending");
  const completedTopics = allTopics.filter((t) => t.status === "completed");
  const upcomingTopics = allTopics.filter((t) => t.status === "pending").slice(0, 3);
  const currentPhase = roadmap?.phases?.find((p) =>
    p.topics.some((t) => t.status === "current")
  );

  /* ── Unauthenticated / Profile empty state ─────────────────── */
  if (!profile.name) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <div className="page-title">Welcome to LearnMate AI</div>
              <div className="page-sub">Your AI-powered personalized learning journey</div>
            </div>
            <div className="granite-badge">
              <div className="granite-dot" /> IBM Granite 4 H Small
            </div>
          </div>
        </div>

        <div className="hero-card mb-24">
          <div className="flex items-center gap-20 mb-24" style={{ flexWrap: "wrap" }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-purple) 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.8rem", color: "#fff", flexShrink: 0,
              boxShadow: "0 4px 20px rgba(59,130,246,0.4)"
            }}>
              🎓
            </div>
            <div>
              <div className="hero-greeting">Accelerate Your Learning with AI</div>
              <div className="hero-sub">
                IBM Granite AI analyzes your skill profile, identifies gaps, and builds
                a tailored step-by-step pathway directly aligned with your career goal.
              </div>
            </div>
          </div>

          <div className="grid-3 gap-16 mb-24">
            {[
              { icon: "🧠", title: "Skill Analysis", desc: "Granite detects skill gaps vs target career goals" },
              { icon: "🗺️", title: "Personalized Roadmap", desc: "Custom structured phases & topics generated in seconds" },
              { icon: "✨", title: "24/7 AI Mentor", desc: "Context-aware mentoring tailored to your active topics" },
            ].map((f) => (
              <div key={f.title} className="card card-sm" style={{ background: "var(--surface2)", textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{f.title}</div>
                <div className="text-muted text-xs">{f.desc}</div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-lg w-full" onClick={() => navigate("/profile")}>
            Setup Profile &amp; Generate Roadmap →
          </button>
        </div>
      </div>
    );
  }

  /* ── Main Dashboard ──────────────────────────── */
  const remainingTopics = allTopics.length - completedTopics.length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-sub">
              Welcome back, <strong style={{ color: "var(--text)" }}>{profile.name}</strong>
              {profile.careerGoal ? ` · Goal: ${profile.careerGoal}` : ""}
              {profile.currentSkillLevel ? ` (${profile.currentSkillLevel.toUpperCase()})` : ""}
            </div>
          </div>
          <div className="granite-badge">
            <div className="granite-dot" /> IBM Granite watsonx.ai
          </div>
        </div>
      </div>

      {/* Hero Progress Banner */}
      <div className="hero-card mb-24">
        <div className="flex items-center gap-24" style={{ flexWrap: "wrap" }}>
          <CircleProgress value={progress.overall} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="flex items-center gap-8 mb-4">
              <span className="badge badge-accent">Career Target</span>
              <span className="text-sm font-600 text-accent">{profile.careerGoal}</span>
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 6 }}>
              {progress.overall === 0
                ? "Your learning pathway is ready"
                : progress.overall === 100
                  ? "🎉 Career Goal Achieved!"
                  : `${progress.overall}% of Pathway Completed`}
            </div>
            <div className="text-muted text-sm mb-12">
              {roadmap
                ? `${completedTopics.length} of ${allTopics.length} topics completed · Est. ${analysis?.estimatedWeeks ?? "—"} weeks total`
                : "Complete your profile to generate your roadmap"}
            </div>
            {currentPhase && (
              <div className="flex items-center gap-8">
                <span className="badge badge-success badge-dot">Active Phase</span>
                <span className="text-sm font-600" style={{ color: "var(--text)" }}>{currentPhase.title}</span>
              </div>
            )}
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate(roadmap ? "/roadmap" : "/profile")}>
            {roadmap ? "Continue Learning →" : "Create Profile →"}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4 gap-16 mb-24">
        <div className="card card-sm stat-card stat-card-accent">
          <div className="stat-value">{progress.overall}%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
        <div className="card card-sm stat-card stat-card-success">
          <div className="stat-value" style={{ color: "var(--success)" }}>{completedTopics.length}</div>
          <div className="stat-label">Topics Completed</div>
        </div>
        <div className="card card-sm stat-card stat-card-warning">
          <div className="stat-value" style={{ color: "var(--warning)" }}>{remainingTopics}</div>
          <div className="stat-label">Remaining Topics</div>
        </div>
        <div className="card card-sm stat-card stat-card-purple">
          <div className="stat-value" style={{ color: "var(--purple)" }}>{analysis?.estimatedWeeks ?? "—"}</div>
          <div className="stat-label">Est. Total Weeks</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2 gap-20">
        {/* Current Topic Module */}
        <div className={`card card-hover${currentTopic ? " card-accent" : ""}`}>
          <div className="card-title">
            <div className="card-icon card-icon-accent">📍</div>
            Current Active Topic
          </div>
          <hr className="card-divider" />
          {currentTopic ? (
            <>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 6, color: "var(--text)" }}>
                {currentTopic.title}
              </div>
              <p className="text-muted text-sm mb-12" style={{ lineHeight: 1.5 }}>
                {currentTopic.description}
              </p>
              {currentTopic.resources?.length > 0 && (
                <div className="topic-resources mb-16">
                  {currentTopic.resources.map((r) => (
                    <span key={r} className="resource-chip">{r}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-8">
                <span className="badge badge-accent">~{currentTopic.durationDays} days</span>
                <button className="btn btn-primary btn-sm ml-auto" onClick={() => navigate("/roadmap")}>
                  View in Roadmap →
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: "28px 0" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🗺️</div>
              <p className="text-muted text-sm">
                {roadmap ? "All topics completed! 🎉" : "Generate your roadmap to see your current topic."}
              </p>
            </div>
          )}
        </div>

        {/* Up Next Module */}
        <div className="card card-hover">
          <div className="card-title">
            <div className="card-icon card-icon-warning">⏭️</div>
            Up Next
          </div>
          <hr className="card-divider" />
          {nextTopic ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>{nextTopic.title}</div>
              <p className="text-muted text-sm mb-12">{nextTopic.description}</p>
              <span className="badge badge-muted">{nextTopic.durationDays} days</span>
            </>
          ) : (
            <p className="text-muted text-sm" style={{ paddingTop: 8 }}>
              {roadmap ? "No upcoming topics." : "Generate a roadmap to see upcoming topics."}
            </p>
          )}

          {upcomingTopics.length > 1 && (
            <>
              <hr className="card-divider" />
              <div className="section-label">More Upcoming</div>
              <div className="flex flex-col gap-10">
                {upcomingTopics.slice(1).map((t) => (
                  <div key={t.id} className="flex items-center gap-10 text-sm">
                    <span style={{ color: "var(--accent)", fontSize: "0.8rem" }}>○</span>
                    <span className="text-sm font-500" style={{ flex: 1, color: "var(--text2)" }}>{t.title}</span>
                    <span className="badge badge-muted">{t.durationDays}d</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Granite Skill Analysis */}
        {analysis ? (
          <div className="card card-hover">
            <div className="card-title">
              <div className="card-icon card-icon-purple">🧠</div>
              Granite Skill Assessment
            </div>
            <hr className="card-divider" />
            <p className="text-sm mb-16" style={{ color: "var(--text2)", lineHeight: 1.6 }}>
              {analysis.summary}
            </p>

            <div className="mb-14">
              <div className="section-label">Verified Strengths</div>
              <div className="tags-input">
                {analysis.existingStrengths?.map((s) => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="section-label">Key Skill Gaps</div>
              <div className="flex gap-8 flex-wrap">
                {analysis.skillGaps?.map((s) => (
                  <span key={s} className="badge badge-warning">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card card-hover">
            <div className="card-title">
              <div className="card-icon card-icon-purple">🧠</div>
              Granite Skill Assessment
            </div>
            <hr className="card-divider" />
            <div className="empty-state" style={{ padding: "20px 0" }}>
              <p className="text-muted text-sm">
                Complete your profile for Granite AI to analyze your skills and identify gaps.
              </p>
              <button className="btn btn-secondary btn-sm mt-12" onClick={() => navigate("/profile")}>
                Go to Profile →
              </button>
            </div>
          </div>
        )}

        {/* Quick Navigation Actions */}
        <div className="card">
          <div className="card-title">
            <div className="card-icon card-icon-success">⚡</div>
            Quick Learning Tools
          </div>
          <hr className="card-divider" />
          <div className="flex flex-col gap-10">
            <button className="btn btn-secondary w-full justify-between" onClick={() => navigate("/roadmap")}>
              <span>🗺️ Interactive Roadmap</span>
              <span className="text-xs text-muted">View phases</span>
            </button>
            <button className="btn btn-secondary w-full justify-between" onClick={() => navigate("/progress")}>
              <span>📊 Progress Dashboard</span>
              <span className="text-xs text-muted">Track topics</span>
            </button>
            <button className="btn btn-primary w-full justify-between" onClick={() => navigate("/mentor")}>
              <span>✨ Ask AI Mentor</span>
              <span className="badge badge-accent">Granite 4 H</span>
            </button>
            <button className="btn btn-ghost w-full justify-between" onClick={() => navigate("/profile")}>
              <span>👤 Edit Student Profile</span>
              <span className="text-xs text-muted">Update skills</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
