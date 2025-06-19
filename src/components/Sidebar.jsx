import { NavLink } from "react-router-dom";
import { Home, PieChart, Globe, Cpu, BarChart2, Lightbulb, Newspaper } from "lucide-react";

const navItems = [
  { to: "/home", label: "Home", icon: <Home size={18} /> },
  { to: "/portfolio", label: "Portfolio", icon: <PieChart size={18} /> },
  { to: "/nationalnews", label: "National News", icon: <Newspaper size={18} /> },
  { to: "/aiprediction", label: "AI Prediction", icon: <Cpu size={18} /> },
  { to: "/impact", label: "Impact", icon: <BarChart2 size={18} /> },
  { to: "/globalnews", label: "Global News", icon: <Globe size={18} /> },
  { to: "/suggestions", label: "Suggestions", icon: <Lightbulb size={18} /> },
];

const Sidebar = () => {
  return (
    <aside className="w-60 fixed top-0 left-0 h-full bg-[#0d1b2a] text-gray-200 shadow-lg z-40">
      <div className="px-6 py-4 text-xl font-bold text-green-400 tracking-wide">
        FinAI
      </div>
      <nav className="flex flex-col space-y-2 px-4">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-[#1b263b] transition ${
                isActive ? "bg-[#1b263b] text-green-400 font-medium" : "text-gray-300"
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
