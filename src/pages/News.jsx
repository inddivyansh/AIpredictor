// src/pages/NationalNews.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchBusinessNews, fetchTopGainers, fetchTopLosers } from "../services/finnhubApi";
import { Search, LogIn, UserPlus } from "lucide-react";
import Sentiment from "sentiment";
import { useLocation } from "react-router-dom";
import companyList from "../data/companyList.json";
import articleFilterList from "../data/articleFilterList.json";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const sentiment = new Sentiment();

function getSentimentType(score) {
  if (score > 1) return "positive";
  if (score < -1) return "negative";
  return "neutral";
}

// Helper: Extract company names mentioned in text using a list of known companies
function extractCompanies(text, companies) {
  const found = [];
  for (const c of companies) {
    // Case-insensitive, whole word match
    const regex = new RegExp(`\\b${c.name}\\b|\\b${c.ticker}\\b`, "i");
    if (regex.test(text)) found.push(c);
  }
  return found;
}

// Helper: Suggest action based on sentiment and context
function getSuggestion(sentimentType, sentimentScore, companies) {
  if (companies.length === 0) return "No major company mentioned";
  // More nuanced suggestion logic
  if (sentimentType === "positive") {
    if (sentimentScore > 3) return `Strong Buy for ${companies.map(c => c.ticker).join(", ")}`;
    return `Consider Buy for ${companies.map(c => c.ticker).join(", ")}`;
  }
  if (sentimentType === "negative") {
    if (sentimentScore < -3) return `Strong Sell for ${companies.map(c => c.ticker).join(", ")}`;
    return `Consider Sell for ${companies.map(c => c.ticker).join(", ")}`;
  }
  return `Hold or Watch for ${companies.map(c => c.ticker).join(", ")}`;
}

const News = ({ sidebarWidth }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");
  const [sentiments, setSentiments] = useState([]);
  const [sentimentFilter, setSentimentFilter] = useState("all"); // "all", "positive", "neutral", "negative"
  const location = useLocation();

  useEffect(() => {
    fetchBusinessNews("IN", 20).then(news => {
      const shuffled = shuffleArray(news.slice(0));
      setArticles(shuffled.slice(0, 10));
      const sentimentScores = shuffled.slice(0, 10).map(a => sentiment.analyze(a.summary).score);
      setSentiments(sentimentScores);
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sentiment = params.get("sentiment");
    if (sentiment === "positive" || sentiment === "neutral" || sentiment === "negative") {
      setSentimentFilter(sentiment);
    }
  }, [location.search]);

  // Filter Indian news based on keywords from articleFilterList
  const filterKeywords = articleFilterList.map(f => f.keyword.toLowerCase());
  const indianNews = articles.filter(n =>
    filterKeywords.some(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      return regex.test((n.headline + " " + n.summary));
    })
  );
  // If no Indian news, show all news
  let displayNews = indianNews.length > 0 ? indianNews : articles;

  // Attach sentiment type and matched keywords to each news
  displayNews = displayNews.map((item, idx) => {
    const text = (item.headline + " " + item.summary).toLowerCase();
    const matchedKeywords = filterKeywords.filter(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      return regex.test(text);
    });
    return {
      ...item,
      sentimentType: getSentimentType(sentiments[idx] ?? 0),
      sentimentScore: sentiments[idx] ?? 0,
      matchedKeywords,
    };
  });

  // Load company list (could be static or fetched)
  // Example: [{ name: "Reliance", ticker: "RELIANCE" }, ...]
  const companies = companyList;

  // Attach company mentions and suggestions to each news
  displayNews = displayNews.map((item, idx) => {
    const text = `${item.headline} ${item.summary}`;
    const mentioned = extractCompanies(text, companies);
    const suggestion = getSuggestion(item.sentimentType, item.sentimentScore, mentioned);
    return {
      ...item,
      mentionedCompanies: mentioned,
      suggestion,
    };
  });

  // Filter by sentiment if needed
  const filteredNews =
    sentimentFilter === "all"
      ? displayNews
      : displayNews.filter(n => n.sentimentType === sentimentFilter);

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

      {/* Sentiment Filter Buttons */}
      <div className="flex gap-3 justify-center my-4">
        <button
          className={`px-4 py-1 rounded-full font-semibold transition ${
            sentimentFilter === "all"
              ? "bg-blue-500 text-white"
              : "bg-slate-700 text-blue-200 hover:bg-blue-600"
          }`}
          onClick={() => setSentimentFilter("all")}
        >
          All
        </button>
        <button
          className={`px-4 py-1 rounded-full font-semibold transition ${
            sentimentFilter === "positive"
              ? "bg-green-500 text-white"
              : "bg-slate-700 text-green-200 hover:bg-green-600"
          }`}
          onClick={() => setSentimentFilter("positive")}
        >
          Positive
        </button>
        <button
          className={`px-4 py-1 rounded-full font-semibold transition ${
            sentimentFilter === "neutral"
              ? "bg-yellow-500 text-white"
              : "bg-slate-700 text-yellow-200 hover:bg-yellow-600"
          }`}
          onClick={() => setSentimentFilter("neutral")}
        >
          Neutral
        </button>
        <button
          className={`px-4 py-1 rounded-full font-semibold transition ${
            sentimentFilter === "negative"
              ? "bg-red-500 text-white"
              : "bg-slate-700 text-red-200 hover:bg-red-600"
          }`}
          onClick={() => setSentimentFilter("negative")}
        >
          Negative
        </button>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-slate-400">Loading news...</div>
        ) : (
          filteredNews
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
                      <span className={`font-bold ${item.sentimentType === "positive" ? "text-green-400" : item.sentimentType === "negative" ? "text-red-400" : "text-yellow-400"}`}>
                        Sentiment: {item.sentimentType.charAt(0).toUpperCase() + item.sentimentType.slice(1)}
                      </span>
                    </div>
                    {/* Show mentioned companies and suggestion */}
                    <div className="mt-2 text-xs">
                      {item.mentionedCompanies.length > 0 ? (
                        <span>
                          <span className="font-semibold text-blue-300">Companies: </span>
                          {item.mentionedCompanies.map(c => (
                            <span key={c.ticker} className="mr-2">{c.name} ({c.ticker})</span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-gray-400">  </span>
                      )}  
                    </div>
                    <div className="mt-1 text-xs font-semibold text-purple-300">
                      Suggestion: {item.suggestion}
                    </div>
                    {/* Show matched keywords */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.matchedKeywords && item.matchedKeywords.length > 0 && (
                        item.matchedKeywords.map((kw, i) => (
                          <span
                            key={kw + i}
                            className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-900 text-blue-200 border border-blue-400"
                          >
                            {kw}
                          </span>
                        ))
                      )}
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

export default News;
