// src/pages/Impact.jsx
import { useEffect, useState } from "react";
import { fetchBusinessNews } from "../services/finnhubApi";
import Sentiment from "sentiment";
import { motion } from "framer-motion";
import { Search, LogIn, UserPlus } from "lucide-react";

const Impact = ({ sidebarWidth }) => {
  const [impacts, setImpacts] = useState([]);
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBusinessNews("IN", 10).then(news => {
      const sentiment = new Sentiment();
      const sectorMap = {
        Energy: ["oil", "crude", "energy"],
        Finance: ["bank", "fed", "interest", "inflation"],
        Consumer: ["food", "retail", "cpi", "consumer"],
        Transport: ["logistics", "transport"],
        Tech: ["tech", "software", "AI"],
      };
      const summaries = Object.entries(sectorMap).map(([sector, keywords]) => {
        const related = news.filter(a =>
          keywords.some(k => a.headline.toLowerCase().includes(k) || a.summary.toLowerCase().includes(k))
        );
        const avg = related.length
          ? related.reduce((a, b) => a + sentiment.analyze(b.summary).score, 0) / related.length
          : 0;
        return {
          sector,
          summary: related[0]?.headline || "No major news",
          impact: avg > 1 ? "Positive" : avg < -1 ? "Negative" : "Neutral",
        };
      });
      setImpacts(summaries);
    });
  }, []);

  useEffect(() => {
    let timeout;
    const fetchStrip = async () => {
      setStripData([]);
      // You can use fetchTopGainers/fetchTopLosers if available, else leave empty
    };
    fetchStrip();
    timeout = setTimeout(() => setStripType(t => (t === "gainers" ? "losers" : "gainers")), 30000);
    return () => clearTimeout(timeout);
  }, [stripType]);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
      style={{ paddingLeft: 0 }} // flush with sidebar
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
        <div className="flex-1 flex items-center overflow-x-hidden">
          <div className="whitespace-nowrap text-sm font-semibold text-blue-300 flex items-center gap-2 animate-marquee" style={{ minWidth: "60%" }}>
            {stripType === "gainers" ? "Top Gainers:" : "Top Losers:"}
            {stripData.map((item, i) => (
              <span key={i} className={`mx-3 px-2 py-1 rounded ${stripType === "gainers" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                {item.symbol} <span className="font-mono">{item.change}%</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              className="bg-slate-700 text-slate-200 rounded-full px-4 py-1 pl-9 outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search stocks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 180 }}
            />
            <Search className="absolute left-2 top-1.5 text-slate-400" size={18} />
          </div>
          <button className="ml-4 px-4 py-1 rounded-full bg-blue-500 text-white font-semibold flex items-center gap-1 hover:bg-blue-600 transition">
            <LogIn size={18} /> Sign In
          </button>
          <button className="ml-2 px-4 py-1 rounded-full bg-green-500 text-white font-semibold flex items-center gap-1 hover:bg-green-600 transition">
            <UserPlus size={18} /> Register
          </button>
        </div>
        <style>{`
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
      {/* Content */}
      <div className="p-4 sm:p-6">
        <h2 className="text-3xl font-bold mb-6 tracking-wide">🌐 Market Impact Analysis</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {impacts.map((item, idx) => (
            <div key={idx} className="bg-slate-800 bg-opacity-80 rounded-2xl shadow-md p-6 flex flex-col gap-2 card-hover">
              <h3 className="text-lg font-semibold text-blue-400 mb-1">{item.sector}</h3>
              <p className="text-sm text-slate-200">{item.summary}</p>
              <div className={`text-xs mt-2 ${item.impact === "Positive" ? "text-green-400" : item.impact === "Negative" ? "text-red-400" : "text-yellow-400"}`}>
                Impact: {item.impact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Impact;
