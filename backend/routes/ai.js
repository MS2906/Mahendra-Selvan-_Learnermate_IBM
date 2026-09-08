/**
 * ai.js — Express router for all Granite-powered endpoints
 * Uses the IBM watsonx.ai Chat API via Granite 4 H Small
 */

const express = require("express");
const { generate } = require("../services/granite");

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/analyze
// Body: { profile }
// Returns: { existingStrengths, skillGaps, priorityOrder, estimatedWeeks, summary }
// ─────────────────────────────────────────────
router.post("/analyze", async (req, res) => {
  const { profile } = req.body;
  if (!profile) return res.status(400).json({ error: "profile is required" });
  if (!profile.name || !profile.careerGoal) {
    return res.status(400).json({ error: "profile.name and profile.careerGoal are required" });
  }

  const system = `You are an expert educational AI advisor. Analyze student profiles and return structured JSON assessments. Always return only valid JSON with no markdown, no code fences, no extra explanation.`;

  const user = `Analyze this student's current skills relative to their career goal.

Student Profile:
- Name: ${profile.name}
- Education Level: ${profile.educationLevel || "not specified"}
- Career Goal: ${profile.careerGoal}
- Current Skills: ${profile.currentSkills?.join(", ") || "none listed"}
- Interests: ${profile.interests?.join(", ") || "none listed"}
- Current Skill Level: ${profile.currentSkillLevel || "beginner"}
- Daily Study Time: ${profile.dailyStudyTime || 1} hours/day

Return ONLY this JSON object (no markdown, no explanation):
{
  "existingStrengths": ["strength1", "strength2"],
  "skillGaps": ["gap1", "gap2", "gap3", "gap4"],
  "priorityOrder": ["most important skill to learn first", "second priority", "third priority"],
  "estimatedWeeks": 12,
  "summary": "2-3 sentence personalized analysis of this student's current position and path to their goal"
}`;

  try {
    const text = await generate(system, user, { maxTokens: 700, temperature: 0.3 });
    const json = extractJSON(text);
    res.json(json);
  } catch (err) {
    console.error("/analyze error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/roadmap
// Body: { profile, analysis }
// Returns: { phases: [...] }
// ─────────────────────────────────────────────
router.post("/roadmap", async (req, res) => {
  const { profile, analysis } = req.body;
  if (!profile || !analysis) {
    return res.status(400).json({ error: "profile and analysis are required" });
  }

  const system = `You are an expert curriculum designer. Create personalized learning roadmaps as structured JSON. Always return only valid JSON with no markdown, no code fences, no extra explanation.`;

  const user = `Create a personalized learning roadmap for this student.

Student: ${profile.name}
Career Goal: ${profile.careerGoal}
Education Level: ${profile.educationLevel || "not specified"}
Current Skills: ${profile.currentSkills?.join(", ") || "none"}
Interests: ${profile.interests?.join(", ") || "none"}
Skill Level: ${profile.currentSkillLevel || "beginner"}
Daily Study Time: ${profile.dailyStudyTime || 1} hours/day
Skill Gaps to Address: ${analysis.skillGaps?.join(", ") || "general skills"}
Priority Order: ${analysis.priorityOrder?.join(", ") || "follow natural learning order"}
Estimated Total Weeks: ${analysis.estimatedWeeks || 12}

Create a personalized roadmap with 3-4 phases. Each phase should build on the previous one.
Set status "current" for the very first topic only, "pending" for all others.

Return ONLY this JSON (no markdown, no explanation):
{
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase title matching the student's goal",
      "durationWeeks": 3,
      "topics": [
        {
          "id": "t1",
          "title": "Specific topic name",
          "description": "Brief description of what student will learn and why it matters for their goal",
          "resources": ["Free resource 1 (e.g. MDN Docs)", "Free resource 2 (e.g. freeCodeCamp)"],
          "durationDays": 4,
          "status": "current"
        }
      ]
    }
  ]
}`;

  try {
    const text = await generate(system, user, { maxTokens: 1500, temperature: 0.4 });
    const json = extractJSON(text);
    res.json(json);
  } catch (err) {
    console.error("/roadmap error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/adaptive
// Body: { profile, analysis, roadmap, feedback, progress }
// Returns: { adjustment, insertTopics, motivationalMessage, adjustedStrategy }
// ─────────────────────────────────────────────
router.post("/adaptive", async (req, res) => {
  const { profile, analysis, roadmap, feedback, progress } = req.body;
  if (!profile || !roadmap || !feedback) {
    return res.status(400).json({ error: "profile, roadmap, and feedback are required" });
  }

  const currentTopic = roadmap.phases
    ?.flatMap((p) => p.topics)
    .find((t) => t.status === "current")?.title || "not started";

  const upcomingTopics = roadmap.phases
    ?.flatMap((p) => p.topics)
    .filter((t) => t.status === "current" || t.status === "pending")
    .slice(0, 5)
    .map((t) => t.title)
    .join(", ") || "none";

  const completedCount = roadmap.phases
    ?.flatMap((p) => p.topics)
    .filter((t) => t.status === "completed").length || 0;

  const system = `You are an adaptive AI learning coach. Analyze student feedback and adapt their learning roadmap. Always return only valid JSON with no markdown, no code fences, no extra explanation.`;

  const user = `A student is struggling and needs their learning roadmap adapted.

Student: ${profile.name}
Career Goal: ${profile.careerGoal}
Current Skill Level: ${profile.currentSkillLevel || "beginner"}
Overall Progress: ${progress?.overall || 0}% (${completedCount} topics completed)
Current Topic: ${currentTopic}
Upcoming Topics: ${upcomingTopics}
Skill Gaps (from initial analysis): ${analysis?.skillGaps?.join(", ") || "general gaps"}

Student's Feedback: "${feedback}"

Based on this feedback, determine what should be added to help the student.
Consider: extra practice exercises, prerequisite review topics, simplified explanations, additional resources.

Return ONLY this JSON (no markdown, no explanation):
{
  "adjustment": "Brief clear description of what is being added and why",
  "insertTopics": [
    {
      "id": "adaptive-1",
      "title": "Extra practice/review topic title",
      "description": "Specific description of what this covers and why it addresses the student's struggle",
      "resources": ["Specific free resource 1", "Specific free resource 2"],
      "durationDays": 3,
      "status": "current"
    }
  ],
  "motivationalMessage": "Encouraging, personalized message for this student addressing their specific struggle",
  "adjustedStrategy": "Brief updated strategy: how to approach the difficult topic going forward"
}`;

  try {
    const text = await generate(system, user, { maxTokens: 900, temperature: 0.5 });
    const json = extractJSON(text);
    res.json(json);
  } catch (err) {
    console.error("/adaptive error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/mentor
// Body: { profile, analysis, roadmap, progress, messages }
// Returns: { reply }
// ─────────────────────────────────────────────
router.post("/mentor", async (req, res) => {
  const { profile, analysis, roadmap, progress, messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const currentTopic =
    roadmap?.phases?.flatMap((p) => p.topics).find((t) => t.status === "current")?.title ||
    "your current topic";

  const currentTopicDesc =
    roadmap?.phases?.flatMap((p) => p.topics).find((t) => t.status === "current")?.description ||
    "";

  const completedCount =
    roadmap?.phases?.flatMap((p) => p.topics).filter((t) => t.status === "completed").length || 0;

  const totalTopics = roadmap?.phases?.flatMap((p) => p.topics).length || 0;

  const upcomingTopics = roadmap?.phases
    ?.flatMap((p) => p.topics)
    .filter((t) => t.status === "pending")
    .slice(0, 3)
    .map((t) => t.title)
    .join(", ") || "none";

  const history = messages
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Student" : "LearnMate"}: ${m.content}`)
    .join("\n");

  const system = `You are LearnMate, a friendly, knowledgeable, and encouraging AI mentor for students. You help students understand their learning material, stay motivated, and make progress toward their career goals. Be concise (2-4 sentences), specific, and practical. Do not use markdown formatting in your reply.`;

  const user = `Student context:
- Name: ${profile?.name || "Student"}
- Career Goal: ${profile?.careerGoal || "not specified"}
- Skill Level: ${profile?.currentSkillLevel || "beginner"}
- Skill Gaps: ${analysis?.skillGaps?.slice(0, 3).join(", ") || "general skills"}
- Current Topic: ${currentTopic}${currentTopicDesc ? ` — ${currentTopicDesc}` : ""}
- Topics Completed: ${completedCount} / ${totalTopics}
- Overall Progress: ${progress?.overall || 0}%
- Upcoming Topics: ${upcomingTopics}

Recent conversation:
${history}

Respond as LearnMate mentor. Be concise (2-4 sentences), encouraging, and specific to this student's situation and current topic. Do not use markdown.`;

  try {
    const reply = await generate(system, user, { maxTokens: 500, temperature: 0.7 });
    res.json({ reply });
  } catch (err) {
    console.error("/mentor error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// Utility: extract first JSON object from text
// Handles markdown code fences (```json ... ```)
// ─────────────────────────────────────────────
function extractJSON(text) {
  // Remove markdown code fences if present
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON found in AI response. Raw: " + text.substring(0, 200));
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (e) {
    throw new Error("Failed to parse JSON from AI response: " + e.message);
  }
}

module.exports = router;
