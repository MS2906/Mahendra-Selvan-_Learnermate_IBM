require("dotenv").config();
const express = require("express");
const cors = require("cors");
const aiRouter = require("./routes/ai");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", model: "ibm/granite-4-h-small" }));

// AI routes
app.use("/api", aiRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\nLearnMate AI backend running on http://localhost:${PORT}`);
  console.log(`  Model    : ibm/granite-4-h-small (Granite 4 H Small)`);
  console.log(`  watsonx  : ${process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com"}`);

  const apiKey = process.env.WATSONX_API_KEY;
  const projectId = process.env.WATSONX_PROJECT_ID;
  const placeholder = (v) => !v || v.startsWith("your_");

  if (placeholder(apiKey)) {
    console.warn(`  ⚠  WATSONX_API_KEY is not set. Edit learnmate/backend/.env`);
  } else {
    console.log(`  API Key  : configured`);
  }
  if (placeholder(projectId)) {
    console.warn(`  ⚠  WATSONX_PROJECT_ID is not set. Edit learnmate/backend/.env`);
  } else {
    console.log(`  Project  : ${projectId}`);
  }
  if (placeholder(apiKey) || placeholder(projectId)) {
    console.warn(`\n  ACTION REQUIRED: Open learnmate/backend/.env and fill in your IBM Cloud credentials.\n`);
  } else {
    console.log(`\n  ✅ All credentials configured — ready to serve requests.\n`);
  }
});
