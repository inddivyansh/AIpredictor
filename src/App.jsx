import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";
import AIPrediction from "./pages/AIPrediction";
import Impact from "./pages/Impact";
import Suggestions from "./pages/Suggestions";
import Settings from "./pages/Settings";
import { useState, useEffect } from "react";

const SIDEBAR_WIDTH = 240;
const SIDEBAR_MINI = 64;

function App() {
  const [theme, setTheme] = useState("dark");
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.className = theme === "dark"
      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white"
      : "bg-gradient-to-br from-slate-100 via-slate-200 to-white text-slate-900";
  }, [theme]);

  return (
    <BrowserRouter>
      <Sidebar onSidebarToggle={setSidebarWidth} />
      <div
        className="flex flex-col min-h-screen transition-all duration-500"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.45s cubic-bezier(.77,0,.18,1)",
        }}
      >
        <Routes>
          <Route path="/home" element={<Home sidebarWidth={sidebarWidth} />} />
          <Route path="/portfolio" element={<Portfolio sidebarWidth={sidebarWidth} />} />
          <Route path="/nationalnews" element={<News sidebarWidth={sidebarWidth} />} />
          <Route path="/aiprediction" element={<AIPrediction sidebarWidth={sidebarWidth} />} />
          <Route path="/impact" element={<Impact sidebarWidth={sidebarWidth} />} />
          <Route path="/suggestions" element={<Suggestions sidebarWidth={sidebarWidth} />} />
          <Route path="/settings" element={
            <Settings
              onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")}
              theme={theme}
              sidebarWidth={sidebarWidth}
            />
          } />
          <Route path="*" element={<Home sidebarWidth={sidebarWidth} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
