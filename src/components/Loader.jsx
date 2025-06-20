import { useState } from "react";

const coinSvg = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="11" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
    <text x="11" y="16" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#fff" fontFamily="Arial">$</text>
  </svg>
);

const Loader = () => {
  const [hovered, setHovered] = useState([false, false, false]);

  const handleMouseEnter = idx => {
    setHovered(h => h.map((v, i) => (i === idx ? true : v)));
  };

  const handleMouseLeave = idx => {
    setHovered(h => h.map((v, i) => (i === idx ? false : v)));
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[70vh]">
      <div className="flex gap-4 items-center justify-center h-[60px]">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="loader-dot animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, cursor: "pointer" }}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={() => handleMouseLeave(i)}
          >
            {hovered[i] ? coinSvg : null}
          </span>
        ))}
      </div>

      <style>{`
        .loader-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8 60%, #facc15 100%);
          display: inline-block;
          position: relative;
          vertical-align: middle;
        }
        .loader-dot svg {
          position: absolute;
          top: 0; left: 0;
        }
        .animate-bounce {
          animation: loader-bounce 1.2s infinite cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes loader-bounce {
          0%, 80%, 100% { transform: translateY(0);}
          40% { transform: translateY(-22px);}
        }
      `}</style>
    </div>
  );
};

export default Loader;
