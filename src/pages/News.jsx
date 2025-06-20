// src/pages/NationalNews.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchBusinessNews, fetchTopGainers, fetchTopLosers } from "../services/finnhubApi";
import { Search, LogIn, UserPlus } from "lucide-react";
import Sentiment from "sentiment";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const NationalNews = ({ sidebarWidth }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");
  const [sentiments, setSentiments] = useState([]);

  useEffect(() => {
    fetchBusinessNews("IN", 20).then(news => {
      const shuffled = shuffleArray(news.slice(0));
      setArticles(shuffled.slice(0, 10));
      const sentiment = new Sentiment();
      setSentiments(shuffled.slice(0, 10).map(a => sentiment.analyze(a.summary).score));
      setLoading(false);
    });
  }, []);

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

  // Filter Indian news based on keywords in headline or summary
  const indianNews = articles.filter(
    n =>
      /india|nse|sensex|nifty|rbi|mumbai|inr|reliance|tata|infosys|hdfc|icici/i.test(
        n.headline + n.summary
      )
  );
  // If no Indian news, show all news
  const displayNews = indianNews.length > 0 ? indianNews : articles;

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
              placeholder="Search news..."
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
      <div className="p-2 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-slate-400">Loading news...</div>
        ) : (
          displayNews
            .filter(item =>
              !search ||
              item.headline.toLowerCase().includes(search.toLowerCase()) ||
              item.summary.toLowerCase().includes(search.toLowerCase())
            )
            .map((item, idx) => (
              <motion.div
                key={idx}
                className="relative bg-slate-800 bg-opacity-80 rounded-2xl shadow-md overflow-hidden card-hover group flex flex-col"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img src={item.image} alt={item.headline} className="w-full h-40 object-cover" />
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">{item.headline}</h3>
                    <p className="text-sm text-gray-300 flex-1">{item.summary.slice(0, 100)}...</p>
                    <div className="text-xs text-slate-400 mb-1">Agency: {item.source}</div>
                    <div className="text-xs text-slate-400 mb-1">
                      Date: {new Date(item.datetime * 1000).toLocaleDateString()} | Time: {new Date(item.datetime * 1000).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-blue-400">Relevance: {item.related}</div>
                    <div className="mt-2 text-xs">
                      <span className={`font-bold ${sentiments[idx] > 1 ? "text-green-400" : sentiments[idx] < -1 ? "text-red-400" : "text-yellow-400"}`}>
                        Sentiment: {sentiments[idx] > 1 ? "Positive" : sentiments[idx] < -1 ? "Negative" : "Neutral"}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-blue-400 underline">Read full article</div>
                  </div>
                </a>
              </motion.div>
            ))
        )}
      </div>
    </motion.div>
  );
};

export default NationalNews;
