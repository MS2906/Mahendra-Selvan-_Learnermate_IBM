/**
 * client.js — thin fetch wrapper for the LearnMate backend
 * All calls go through Vite's proxy → /api → localhost:3001
 */

const BASE = "/api";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  analyze: (profile) => post("/analyze", { profile }),
  roadmap: (profile, analysis) => post("/roadmap", { profile, analysis }),
  adaptive: (profile, analysis, roadmap, feedback, progress) =>
    post("/adaptive", { profile, analysis, roadmap, feedback, progress }),
  mentor: (profile, analysis, roadmap, progress, messages) =>
    post("/mentor", { profile, analysis, roadmap, progress, messages }),
};
