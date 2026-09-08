# LearnMate AI 🎓
**Agentic AI for Personalized Course Pathways**  
Powered by **IBM Granite 4 H Small** via IBM watsonx.ai

---

## What It Does

LearnMate AI is a full-stack web application that uses IBM Granite 4 H Small to:

1. **Analyze** a student's skills and identify gaps
2. **Generate** a personalized multi-phase learning roadmap
3. **Adapt** the roadmap in real time based on student feedback
4. **Mentor** students through a chat interface with full context awareness

### Workflow

```
Student Profile → Granite Analysis → Skill Gap Detection
    → Personalized Roadmap → Progress Tracking → Adaptive Roadmap → AI Mentor
```

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, React Router v6     |
| Backend   | Node.js, Express 4                  |
| AI Model  | IBM Granite 4 H Small (`ibm/granite-4-h-small`) |
| AI API    | IBM watsonx.ai Chat REST API (`/ml/v1/text/chat`) |
| Auth      | IBM Cloud IAM (API key → Bearer token) |

---

## Prerequisites

- **Node.js 18+**
- An **IBM Cloud** account (Lite tier works)
- A **watsonx.ai** project

---

## IBM Cloud & watsonx.ai Setup

### Step 1 — Create an IBM Cloud account
Go to [cloud.ibm.com](https://cloud.ibm.com) and sign up for a free Lite account.

### Step 2 — Provision watsonx.ai
1. Search for **"Watson Studio"** in the IBM Cloud catalog and create an instance (Lite plan).
2. Search for **"Watson Machine Learning"** and create an instance (Lite plan).
3. Go to [dataplatform.cloud.ibm.com](https://dataplatform.cloud.ibm.com).
4. Create a new **Project**, associate the WML service with it.
5. Copy your **Project ID** from Project → Manage → General.

### Step 3 — Get your IBM Cloud API Key
1. In IBM Cloud, go to **Manage → Access (IAM) → API keys**.
2. Create a new API key and copy it immediately.

### Step 4 — Find the watsonx.ai URL
The default for Dallas (us-south) is:
```
https://us-south.ml.cloud.ibm.com
```
Other regions: `eu-de`, `eu-gb`, `au-syd`, `jp-tok` — replace `us-south` accordingly.

### Step 5 — Verify model access
In your watsonx.ai project, open **Prompt Lab**, search for **`granite-4-h-small`** and confirm it's available.  
The model is available in the **Dallas (us-south)** and **Frankfurt (eu-de)** regions.

---

## Installation & Setup

### 1. Backend

```bash
cd learnmate/backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
WATSONX_API_KEY=your_ibm_cloud_api_key
WATSONX_PROJECT_ID=your_watsonx_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
PORT=3001
```

Start the backend:
```bash
npm run dev
# or: npm start
```

Verify it's running:
```
http://localhost:3001/health
→ {"status":"ok","model":"ibm/granite-4-h-small"}
```

### 2. Frontend

```bash
cd learnmate/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Usage

1. **Profile** — Fill in your name, career goal, skills, and study time → click **Analyze & Generate Roadmap**
2. **Dashboard** — See Granite's analysis, your current topic, and upcoming topics
3. **Roadmap** — View all phases and topics; mark topics complete; submit feedback to adapt
4. **Progress** — Track phase-by-phase and overall completion
5. **AI Mentor** — Chat with LearnMate; it knows your profile, roadmap, progress, and skill gaps

### Adaptive AI Example
On the Roadmap page, in the **Adaptive AI** box, type:
> "I am struggling with JavaScript closures and async/await"

Granite will insert targeted revision topics before your next steps.

---

## API Endpoints

| Method | Path             | Description                                 |
|--------|------------------|---------------------------------------------|
| GET    | `/health`        | Health check                                |
| POST   | `/api/analyze`   | Granite skill analysis & gap detection      |
| POST   | `/api/roadmap`   | Generate personalized multi-phase roadmap   |
| POST   | `/api/adaptive`  | Adapt roadmap based on student feedback     |
| POST   | `/api/mentor`    | AI mentor chat response                     |

---

## Project Structure

```
learnmate/
├── backend/
│   ├── server.js               # Express entry point
│   ├── routes/ai.js            # /analyze /roadmap /adaptive /mentor
│   ├── services/granite.js     # IBM watsonx.ai Chat API client (IAM + chat)
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── api/client.js           # fetch wrapper → backend
    │   ├── context/AppContext.jsx  # global state
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── ProgressBar.jsx
    │   └── pages/
    │       ├── Dashboard.jsx
    │       ├── Profile.jsx
    │       ├── Roadmap.jsx
    │       ├── Progress.jsx
    │       └── Mentor.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Security Notes

- **API keys are never exposed to the browser.** They live only in backend `.env`.
- The Vite dev proxy forwards `/api/*` → `http://localhost:3001` so the frontend never holds credentials.
- Startup logs only show `API Key: configured` — never the key value.
- Add `.env` to `.gitignore` before committing.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `WATSONX_API_KEY is not set` on startup | Check `.env` file in `backend/` |
| `IBM Cloud API key is invalid or expired` | Create a new API key at cloud.ibm.com → Manage → IAM → API keys |
| `HTTP 404` on model | Ensure `granite-4-h-small` is available in your region (us-south or eu-de) |
| `HTTP 403` | Project ID is wrong, or WML service not associated with project |
| `No JSON found in AI response` | Granite returned unexpected output — retry; may be a transient issue |
| CORS error in browser | Ensure backend is running on port 3001 |

---

## License

MIT — free for personal and commercial use.
