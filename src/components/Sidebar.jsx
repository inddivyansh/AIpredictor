import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, PieChart, BarChart2, Lightbulb, Newspaper, Settings, ChevronLeft, ChevronRight, Menu } from "lucide-react";

const Logo = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <circle cx="19" cy="19" r="19" fill="#38bdf8"/>
    <path d="M11 25L19 13L27 25" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="19" cy="25" r="2" fill="#fff"/>
  </svg>
);

const navItems = [
  { to: "/home", label: "Home", icon: <Home size={20} /> },
  { to: "/portfolio", label: "Portfolio", icon: <PieChart size={20} /> },
  { to: "/impact", label: "Impact", icon: <BarChart2 size={20} /> },
  { to: "/aiprediction", label: "AI Prediction", icon: <Lightbulb size={20} /> },
  { to: "/nationalnews", label: "News", icon: <Newspaper size={20} /> },
  { to: "/suggestions", label: "Suggestions", icon: <BarChart2 size={20} /> },
  { to: "/settings", label: "Settings", icon: <Settings size={20} /> },
];

const SIDEBAR_WIDTH = 240;
const SIDEBAR_MINI = 64;

const Sidebar = ({ onSidebarToggle }) => {
  const [minimized, setMinimized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Responsive toggle for mobile
  const handleToggle = () => {
    setMinimized(m => {
      const next = !m;
      if (onSidebarToggle) onSidebarToggle(next ? SIDEBAR_MINI : SIDEBAR_WIDTH);
      return next;
    });
  };

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-50 bg-[#1b263b] p-2 rounded-full shadow border border-slate-700 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-[#0d1b2a] via-[#1b263b] to-[#16213e] text-gray-200 shadow-2xl z-40 flex flex-col
          transition-all duration-500
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
        style={{
          width: minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH,
          minWidth: minimized ? SIDEBAR_MINI : SIDEBAR_WIDTH,
        }}
      >
        <div className="flex items-center gap-3 px-3 py-7 select-none relative">
          <Logo />
          <span
            className={`text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-green-300 to-blue-500 bg-clip-text text-transparent drop-shadow-lg transition-all duration-500
              ${minimized ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
            `}
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              maxWidth: minimized ? 0 : 120,
              transition: "opacity 0.35s, margin 0.35s, width 0.45s cubic-bezier(.77,0,.18,1)",
              display: minimized ? "inline-block" : "inline",
              fontSize: "1rem",
            }}
          >
            Fin<span className="font-black text-white drop-shadow">Hub</span>
          </span>
          {/* Collapse/Expand Chevron */}
          <button
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-[#1b263b] border border-slate-700 rounded-full p-1 shadow hover:bg-[#16213e] transition z-50 hidden md:block"
            style={{ width: 28, height: 28 }}
            onClick={handleToggle}
            aria-label={minimized ? "Expand sidebar" : "Collapse sidebar"}
          >
            {minimized ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          {/* Mobile close */}
          <button
            className="absolute right-2 top-2 md:hidden bg-[#1b263b] border border-slate-700 rounded-full p-1 shadow hover:bg-[#16213e] transition"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <nav className="flex flex-col space-y-2 px-2 overflow-y-auto">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-xl text-base font-medium hover:bg-[#1b263b] transition card-hover ${
                  isActive ? "bg-[#1b263b] text-green-400 font-semibold" : "text-gray-300"
                } ${minimized ? "justify-center px-2" : ""}`
              }
              style={{
                fontFamily: "'Space Grotesk', Arial, sans-serif",
                fontSize: "1rem",
                minHeight: 44,
              }}
              onClick={() => setMobileOpen(false)}
              title={minimized ? label : undefined}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                {icon}
              </span>
              <span
                className={`transition-all duration-500 ${minimized ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}`}
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: minimized ? 0 : 120,
                  transition: "opacity 0.35s, margin 0.35s, width 0.45s cubic-bezier(.77,0,.18,1)",
                  display: minimized ? "inline-block" : "inline",
                  fontSize: "1rem",
                }}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="flex-1" />
      </aside>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
