import { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

const INITIAL_PROFILE = {
  name: "",
  educationLevel: "undergraduate",
  currentSkills: [],
  interests: [],
  careerGoal: "",
  currentSkillLevel: "beginner",
  dailyStudyTime: 1,
};

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [analysis, setAnalysis] = useState(null);   // Granite skill analysis
  const [roadmap, setRoadmap] = useState(null);      // Generated roadmap
  const [progress, setProgress] = useState({ overall: 0, topicsCompleted: 0, totalTopics: 0 });
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Hi! I'm LearnMate, your AI mentor powered by IBM Granite. Ask me anything about your learning journey!" }
  ]);

  // Recompute progress whenever roadmap changes
  const updateRoadmap = useCallback((newRoadmap) => {
    setRoadmap(newRoadmap);
    if (!newRoadmap?.phases) return;
    const all = newRoadmap.phases.flatMap((p) => p.topics);
    const done = all.filter((t) => t.status === "completed").length;
    setProgress({
      overall: all.length ? Math.round((done / all.length) * 100) : 0,
      topicsCompleted: done,
      totalTopics: all.length,
    });
  }, []);

  // Mark a topic completed and advance "current"
  const completeTopic = useCallback((topicId) => {
    setRoadmap((prev) => {
      if (!prev) return prev;
      const allTopics = prev.phases.flatMap((p) => p.topics);
      const idx = allTopics.findIndex((t) => t.id === topicId);
      const updated = allTopics.map((t, i) => ({
        ...t,
        status:
          i < idx ? t.status
          : i === idx ? "completed"
          : i === idx + 1 ? "current"
          : t.status,
      }));
      let ti = 0;
      const phases = prev.phases.map((p) => ({
        ...p,
        topics: p.topics.map(() => updated[ti++]),
      }));
      const done = updated.filter((t) => t.status === "completed").length;
      setProgress({
        overall: updated.length ? Math.round((done / updated.length) * 100) : 0,
        topicsCompleted: done,
        totalTopics: updated.length,
      });
      return { ...prev, phases };
    });
  }, []);

  const addMessage = useCallback((role, content) => {
    setChatHistory((prev) => [...prev, { role, content }]);
  }, []);

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      analysis, setAnalysis,
      roadmap, updateRoadmap,
      progress,
      chatHistory, addMessage,
      completeTopic,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
