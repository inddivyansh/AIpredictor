import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";
import AIPrediction from "./pages/AIPrediction";
import Impact from "./pages/Impact";
import Suggestions from "./pages/Suggestions";
import Settings from "./pages/Settings";
import { useState, useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_MINI = 64;

function AppContent() {
  const [theme, setTheme] = useState("dark");
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);
  const [minimized, setMinimized] = useState(true); // Start minimized
  const location = useLocation();

  useEffect(() => {
    // Minimize on home, expand elsewhere
    if (location.pathname === "/home" || location.pathname === "/") {
      setMinimized(true);
    } else {
      setMinimized(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.className = theme === "dark"
      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white"
      : "bg-gradient-to-br from-slate-100 via-slate-200 to-white text-slate-900";
  }, [theme]);

  return (
    <>
      <Sidebar
        onSidebarToggle={setSidebarWidth}
        minimized={minimized}
        setMinimized={setMinimized}
      />
      <div
        className="flex flex-col min-h-screen transition-all duration-500"
        style={{
          marginLeft: minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH,
          transition: "margin-left 0.45s cubic-bezier(.77,0,.18,1)",
        }}
      >
        <Routes>
          <Route path="/home" element={<Home sidebarWidth={minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH} />} />
          <Route path="/portfolio" element={<Portfolio sidebarWidth={minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH} />} />
          <Route path="/nationalnews" element={<News sidebarWidth={minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH} />} />
          <Route path="/aiprediction" element={<AIPrediction sidebarWidth={minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH} />} />
          <Route path="/impact" element={<Impact sidebarWidth={minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH} />} />
          <Route path="/suggestions" element={<Suggestions sidebarWidth={minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH} />} />
          <Route path="/settings" element={
            <Settings
              onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")}
              theme={theme}
              sidebarWidth={minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH}
            />
          } />
          <Route path="*" element={<Home sidebarWidth={minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH} />} />
        </Routes>
      </div>
      <Analytics />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
