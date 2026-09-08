import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Roadmap from "./pages/Roadmap";
import Progress from "./pages/Progress";
import Mentor from "./pages/Mentor";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-layout">
          {/* Mobile hamburger */}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>

          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="main-content">
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/profile"  element={<Profile />} />
              <Route path="/roadmap"  element={<Roadmap />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/mentor"   element={<Mentor />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
