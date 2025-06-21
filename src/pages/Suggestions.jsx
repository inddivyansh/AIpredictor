// src/pages/Suggestions.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchBusinessNews, fetchTopGainers, fetchTopLosers } from "../services/finnhubApi";
import { Search, LogIn, UserPlus, Lightbulb, ExternalLink, X } from "lucide-react";
import Sentiment from "sentiment";
import companyList from "../data/companyList.json";

function shuffleArray(array) {
  // Fisher-Yates shuffle
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const Suggestions = ({ sidebarWidth }) => {
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      // Find companies with at least one matching article
      const matchedSuggestions = companyList.map(company => {
        const regex = new RegExp(`\\b${company.name}\\b`, "i");
        const related = news.filter(
          n => regex.test(n.headline || "") || regex.test(n.summary || "")
        );
        if (related.length === 0) return null;
        const avg = related.reduce((sum, n) => sum + sentiment.analyze(n.summary || "").score, 0) / related.length;
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
          stock: company.name,
          action,
          reason: `Avg sentiment from ${related.length} news: ${avg.toFixed(2)}`,
          icon,
          relatedNews: related,
        };
      }).filter(Boolean);

      // If none match, show any 12 shuffled companies with dummy news
      if (matchedSuggestions.length === 0) {
        const shuffled = shuffleArray(companyList).slice(0, 12);
        setAiSuggestions(
          shuffled.map(company => ({
            stock: company.name,
            action: "Hold",
            reason: "No recent news found. Hold position.",
            icon: <Lightbulb size={28} className="text-yellow-400" />,
            relatedNews: [
              {
                source: "Moneycontrol",
                headline: "No news available for this company.",
                summary: "There are currently no news articles related to this company.",
                url: `https://www.moneycontrol.com/`,
                datetime: null
              }
            ],
          }))
        );
      } else {
        setAiSuggestions(matchedSuggestions);
      }
      setLoading(false);
    });
  }, []);

  const handleExpand = idx => {
    setExpanded(idx);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setExpanded(null);
  };

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
                <motion.div
                  key={idx}
                  className="bg-slate-800 bg-opacity-80 rounded-2xl shadow-md p-6 flex flex-col gap-2 card-hover cursor-pointer"
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)" }}
                  onClick={() => handleExpand(idx)}
                >
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
                </motion.div>
              ))}
          </div>
        )}
      </div>
      {/* Expanded Modal */}
      <AnimatePresence>
        {showModal && expanded !== null && aiSuggestions[expanded] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backdropFilter: "blur(4px)" }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-slate-900 rounded-2xl shadow-2xl p-0 w-full max-w-2xl relative flex flex-col items-stretch"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                height: "500px",
                maxHeight: "90vh",
                width: "540px",
                minWidth: "320px",
                overflow: "hidden",
                display: "flex"
              }}
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-red-400 text-2xl z-10"
                onClick={handleCloseModal}
                title="Close"
              >
                <X size={28} />
              </button>
              <div className="flex flex-col items-center pt-8 pb-2">
                <span className="text-2xl font-bold text-blue-300 tracking-wide mb-1" style={{ wordBreak: "break-all" }}>
                  {aiSuggestions[expanded]?.stock || ""}
                </span>
                <span className={`text-sm font-semibold rounded-full px-3 py-1 ${
                  aiSuggestions[expanded]?.action === "Buy" ? "bg-green-600 text-white" :
                  aiSuggestions[expanded]?.action === "Sell" ? "bg-red-600 text-white" :
                  "bg-yellow-500 text-white"
                }`}>
                  {aiSuggestions[expanded]?.action || ""}
                </span>
                <p className="text-slate-300 mt-2">{aiSuggestions[expanded]?.reason}</p>
              </div>
              {/* News section: always rendered, always scrollable */}
              <div
                className="flex-1 w-full px-8 pb-6 pt-2 overflow-y-auto"
                style={{
                  borderTop: "1px solid #334155",
                  background: "rgba(30,41,59,0.98)"
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-3">Related News Articles</h3>
                <div className="space-y-3">
                  {(aiSuggestions[expanded]?.relatedNews?.length ?? 0) === 0 ? (
                    <div className="text-slate-400 text-sm">No related news found for this stock.</div>
                  ) : (
                    aiSuggestions[expanded].relatedNews.map((newsItem, index) => (
                      <div key={index} className="bg-slate-800 rounded-lg p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-blue-300">{newsItem.source || ""}</span>
                          <span className="text-xs text-slate-400">{newsItem.datetime ? new Date(newsItem.datetime).toLocaleString() : ""}</span>
                        </div>
                        <a href={newsItem.url} target="_blank" rel="noopener noreferrer" className="text-md font-semibold text-white hover:underline flex items-center gap-1">
                          {newsItem.headline}
                          <ExternalLink size={14} />
                        </a>
                        <p className="text-sm text-slate-200 line-clamp-2">{newsItem.summary}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Suggestions;