import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News"; // Renamed import
import AIPrediction from "./pages/AIPrediction";
import Impact from "./pages/Impact";
import Suggestions from "./pages/Suggestions";
import { useState, useEffect } from "react";

const SIDEBAR_WIDTH = 240;
const SIDEBAR_MINI = 64;

function Settings({ onThemeToggle, theme, sidebarWidth }) {
  // Simple login/register/logout UI for demonstration
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "login" || mode === "register") setUser({ name: form.username });
    if (mode === "logout") setUser(null);
  };

  return (
    <div className="p-6 min-h-screen" style={{ paddingLeft: sidebarWidth }}>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="bg-white bg-opacity-10 rounded-2xl p-6 shadow-md max-w-md space-y-6">
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={onThemeToggle}
              className="form-checkbox accent-blue-500"
            />
            <span className="text-lg">Dark Mode</span>
          </label>
        </div>
        <div>
          {user ? (
            <div>
              <p className="mb-2">Logged in as <span className="font-semibold">{user.name}</span></p>
              <button
                className="bg-red-500 px-4 py-2 rounded text-white font-semibold"
                onClick={() => { setMode("logout"); setUser(null); }}
              >
                Logout
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-3 py-2 rounded bg-slate-800 text-white"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 rounded bg-slate-800 text-white"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 px-4 py-2 rounded text-white font-semibold"
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
                <button
                  type="submit"
                  className="bg-green-500 px-4 py-2 rounded text-white font-semibold"
                  onClick={() => setMode("register")}
                >
                  Register
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <div className="flex flex-col min-h-screen transition-all duration-500"
        style={{ marginLeft: sidebarWidth, transition: "margin-left 0.45s cubic-bezier(.77,0,.18,1)" }}>
        <Routes>
          <Route path="/home" element={<Home sidebarWidth={sidebarWidth} />} />
          <Route path="/portfolio" element={<Portfolio sidebarWidth={sidebarWidth} />} />
          <Route path="/nationalnews" element={<News sidebarWidth={sidebarWidth} />} /> {/* Renamed */}
          <Route path="/aiprediction" element={<AIPrediction sidebarWidth={sidebarWidth} />} />
          <Route path="/impact" element={<Impact sidebarWidth={sidebarWidth} />} />
          <Route path="/suggestions" element={<Suggestions sidebarWidth={sidebarWidth} />} />
          <Route path="/settings" element={<Settings onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} theme={theme} sidebarWidth={sidebarWidth} />} />
          <Route path="*" element={<Home sidebarWidth={sidebarWidth} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
