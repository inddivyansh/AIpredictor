// src/pages/Impact.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchBusinessNews, fetchTopGainers, fetchTopLosers } from "../services/finnhubApi";
import { Search, LogIn, UserPlus } from "lucide-react";
import Sentiment from "sentiment";

const sectorKeywords = {
  Energy: ["oil", "energy", "opec", "gas", "petrol", "refinery", "ONGC", "RELIANCE"],
  Tech: ["tech", "software", "chip", "IT", "AI", "cloud", "TCS", "INFY", "WIPRO", "HCL"],
  Finance: ["bank", "finance", "loan", "RBI", "interest", "HDFC", "ICICI", "SBI", "AXIS"],
  Pharma: ["pharma", "drug", "medicine", "vaccine", "biotech", "SUNPHARMA", "CIPLA", "DRREDDY"],
  Auto: ["auto", "car", "vehicle", "EV", "TATA", "MARUTI", "MAHINDRA", "BAJAJ"],
  FMCG: ["fmcg", "consumer", "food", "HUL", "ITC", "NESTLE", "BRITANNIA"],
};

function getSector(text) {
  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    if (keywords.some(k => text.toLowerCase().includes(k.toLowerCase()))) {
      return sector;
    }
  }
  return "Other";
}

const Impact = ({ sidebarWidth }) => {
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");
  const [sectorImpacts, setSectorImpacts] = useState([]);
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
      // Group news by sector and aggregate sentiment
      const sectorMap = {};
      news.forEach(article => {
        const sector = getSector(article.headline + " " + article.summary);
        const score = sentiment.analyze(article.summary).score;
        if (!sectorMap[sector]) {
          sectorMap[sector] = { sector, articles: [], total: 0, count: 0 };
        }
        sectorMap[sector].articles.push(article);
        sectorMap[sector].total += score;
        sectorMap[sector].count += 1;
      });
      const impacts = Object.values(sectorMap)
        .map(({ sector, articles, total, count }) => {
          const avg = total / count;
          let impact = "Neutral";
          if (avg > 1) impact = "Positive";
          else if (avg < -1) impact = "Negative";
          return {
            sector,
            summary: articles[0]?.summary || "",
            impact,
            avgSentiment: avg,
            count,
          };
        })
        .sort((a, b) => b.count - a.count);
      setSectorImpacts(impacts);
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
              placeholder="Search sectors..."
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
      <div className="p-2 sm:p-4 md:p-8 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-6 tracking-wide text-white">
          🌐 Market Impact Analysis (AI-Powered)
        </h2>
        {loading ? (
          <div className="text-center text-slate-400">Analyzing news and calculating sentiment...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sectorImpacts
              .filter(
                item =>
                  !search ||
                  item.sector.toLowerCase().includes(search.toLowerCase()) ||
                  item.summary.toLowerCase().includes(search.toLowerCase())
              )
              .map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800 bg-opacity-80 rounded-2xl shadow-md p-6 flex flex-col gap-2 card-hover"
                >
                  <h3 className="text-lg font-semibold text-blue-400 mb-1">
                    {item.sector}
                  </h3>
                  <p className="text-sm text-slate-200">{item.summary}</p>
                  <div
                    className={`text-xs mt-2 ${
                      item.impact === "Positive"
                        ? "text-green-400"
                        : item.impact === "Negative"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    Impact: {item.impact} (Avg Sentiment: {item.avgSentiment.toFixed(2)})
                  </div>
                  <div className="text-xs text-slate-400">
                    News articles analyzed: {item.count}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Impact;
