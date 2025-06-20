// src/pages/Suggestions.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchBusinessNews, fetchTopGainers, fetchTopLosers } from "../services/finnhubApi";
import { Search, LogIn, UserPlus, Lightbulb } from "lucide-react";
import Sentiment from "sentiment";

const trackedStocks = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "LT", "AXISBANK", "HCLTECH", "BAJFINANCE", "ITC", "KOTAKBANK"
];

const Suggestions = ({ sidebarWidth }) => {
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout;
    const fetchStrip = async () => {
      setStripData([]);
      if (stripType === "gainers") {
        const data = await fetchTopGainers();
        setStripData(data || []);
      } else {
        const data = await fetchTopLosers();
        setStripData(data || []);
      }
    };
    fetchStrip();
    timeout = setTimeout(() => setStripType(t => (t === "gainers" ? "losers" : "gainers")), 30000);
    return () => clearTimeout(timeout);
  }, [stripType]);

  useEffect(() => {
    setLoading(true);
    fetchBusinessNews("IN", 30).then(news => {
      const sentiment = new Sentiment();
      // For each tracked stock, analyze news and generate suggestion
      const suggestions = trackedStocks.map(stock => {
        const related = news.filter(
          n =>
            n.headline.toLowerCase().includes(stock.toLowerCase()) ||
            n.summary.toLowerCase().includes(stock.toLowerCase())
        );
        if (!related.length) {
          return {
            stock,
            action: "Hold",
            reason: "No recent news found. Hold position.",
            icon: <Lightbulb size={28} className="text-yellow-400" />,
          };
        }
        const avg = related.reduce((sum, n) => sum + sentiment.analyze(n.summary).score, 0) / related.length;
        let action = "Hold";
        let icon = <Lightbulb size={28} className="text-yellow-400" />;
        if (avg > 1) {
          action = "Buy";
          icon = <Lightbulb size={28} className="text-green-400" />;
        } else if (avg < -1) {
          action = "Sell";
          icon = <Lightbulb size={28} className="text-red-400" />;
        }
        return {
          stock,
          action,
          reason: `Avg sentiment from ${related.length} news: ${avg.toFixed(2)}`,
          icon,
        };
      });
      setAiSuggestions(suggestions);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
      style={{ paddingLeft: 0 }}
    >
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 sm:px-6 py-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
        <div className="flex-1 flex items-center overflow-x-hidden w-full">
          <div className="whitespace-nowrap text-sm font-semibold text-blue-300 flex items-center gap-2 animate-marquee" style={{ minWidth: "60%" }}>
            {stripType === "gainers" ? "Top Gainers:" : "Top Losers:"}
            {stripData.map((item, i) => (
              <span key={i} className={`mx-3 px-2 py-1 rounded ${stripType === "gainers" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                {item.symbol} <span className="font-mono">{item.change}%</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <div className="relative w-full max-w-[180px]">
            <input
              type="text"
              className="bg-slate-700 text-slate-200 rounded-full px-4 py-1 pl-9 outline-none focus:ring-2 focus:ring-blue-400 w-full"
              placeholder="Search suggestions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-2 top-1.5 text-slate-400" size={18} />
          </div>
          <button className="px-4 py-1 rounded-full bg-blue-500 text-white font-semibold flex items-center gap-1 hover:bg-blue-600 transition">
            <LogIn size={18} /> <span className="hidden sm:inline">Sign In</span>
          </button>
          <button className="px-4 py-1 rounded-full bg-green-500 text-white font-semibold flex items-center gap-1 hover:bg-green-600 transition">
            <UserPlus size={18} /> <span className="hidden sm:inline">Register</span>
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
      <div className="p-2 sm:p-4 md:p-8 max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-6 tracking-wide text-white">✨ AI-Powered Investment Suggestions</h2>
        {loading ? (
          <div className="text-center text-slate-400">Analyzing news and generating suggestions...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {aiSuggestions
              .filter(s =>
                !search ||
                s.stock.toLowerCase().includes(search.toLowerCase()) ||
                s.action.toLowerCase().includes(search.toLowerCase()) ||
                s.reason.toLowerCase().includes(search.toLowerCase())
              )
              .map((s, idx) => (
                <div key={idx} className="bg-slate-800 bg-opacity-80 rounded-2xl shadow-md p-6 flex flex-col gap-2 card-hover">
                  <div className="flex items-center gap-3 mb-2">
                    {s.icon}
                    <span className="text-lg font-semibold text-blue-300">{s.stock}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      s.action === "Buy" ? "bg-green-600 text-white" :
                      s.action === "Hold" ? "bg-yellow-500 text-white" :
                      "bg-red-600 text-white"
                    }`}>
                      {s.action}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">{s.reason}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Suggestions;
