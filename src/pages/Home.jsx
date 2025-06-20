import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LogIn, UserPlus, PieChart, BarChart2, Cpu, Newspaper, Lightbulb } from "lucide-react";
import DarkLineChart from "../components/DarkLineChart";
import { fetchTopGainers, fetchTopLosers, fetchFinnhubStocks, fetchOptionData, fetchStockChart } from "../services/finnhubApi";

const BUTTONS = [
  { key: "stocks", label: "Market Stocks" },
  { key: "options", label: "Options Trading" },
  { key: "news", label: "News" },
  { key: "ai", label: "AI Suggestions" },
];

// Fallback data for 12 stocks
const fallbackStocks = [
  { symbol: "RELIANCE", price: 2850, open: 2820, high: 2870, low: 2800, volume: 1200000, change: 0.8, aiOpinion: "Buy" },
  { symbol: "TCS", price: 3700, open: 3680, high: 3720, low: 3660, volume: 900000, change: 0.5, aiOpinion: "Hold" },
  { symbol: "INFY", price: 1550, open: 1540, high: 1560, low: 1530, volume: 800000, change: -0.2, aiOpinion: "Sell" },
  { symbol: "HDFCBANK", price: 1620, open: 1600, high: 1635, low: 1590, volume: 1100000, change: 1.1, aiOpinion: "Buy" },
  { symbol: "ICICIBANK", price: 940, open: 930, high: 950, low: 925, volume: 950000, change: 0.6, aiOpinion: "Hold" },
  { symbol: "SBIN", price: 590, open: 585, high: 600, low: 580, volume: 870000, change: 0.3, aiOpinion: "Buy" },
  { symbol: "LT", price: 3550, open: 3520, high: 3570, low: 3500, volume: 650000, change: 0.9, aiOpinion: "Hold" },
  { symbol: "AXISBANK", price: 1100, open: 1090, high: 1115, low: 1080, volume: 720000, change: 0.4, aiOpinion: "Sell" },
  { symbol: "HCLTECH", price: 1450, open: 1440, high: 1465, low: 1430, volume: 610000, change: 0.2, aiOpinion: "Hold" },
  { symbol: "BAJFINANCE", price: 7200, open: 7150, high: 7250, low: 7100, volume: 530000, change: 0.7, aiOpinion: "Buy" },
  { symbol: "ITC", price: 440, open: 438, high: 445, low: 435, volume: 800000, change: 0.1, aiOpinion: "Hold" },
  { symbol: "KOTAKBANK", price: 1750, open: 1740, high: 1765, low: 1730, volume: 600000, change: -0.3, aiOpinion: "Sell" },
];

const features = [
  {
    title: "Portfolio",
    desc: "Track your investments and sector allocation in real time.",
    icon: <PieChart size={32} className="text-blue-400" />,
    to: "/portfolio",
    color: "from-blue-700 to-blue-500"
  },
  {
    title: "Impact",
    desc: "See how news and events impact your stocks.",
    icon: <BarChart2 size={32} className="text-green-400" />,
    to: "/impact",
    color: "from-green-700 to-green-500"
  },
  {
    title: "AI Prediction",
    desc: "Get AI-powered forecasts for your favorite stocks.",
    icon: <Cpu size={32} className="text-cyan-400" />,
    to: "/aiprediction",
    color: "from-cyan-700 to-cyan-500"
  },
  {
    title: "News",
    desc: "Stay updated with the latest national and global news.",
    icon: <Newspaper size={32} className="text-yellow-400" />,
    to: "/nationalnews",
    color: "from-yellow-700 to-yellow-500"
  },
  {
    title: "Suggestions",
    desc: "Get personalized investment suggestions.",
    icon: <Lightbulb size={32} className="text-pink-400" />,
    to: "/suggestions",
    color: "from-pink-700 to-pink-500"
  }
];

const Home = () => {
  const [focus, setFocus] = useState("stocks");
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");
  const [stocks, setStocks] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState(1);
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [expandedStock, setExpandedStock] = useState(null);
  const [expandedChartData, setExpandedChartData] = useState([]);
  const [expandedTimeframe, setExpandedTimeframe] = useState(1);
  const [expandedChartType, setExpandedChartType] = useState("line"); // "line" or "candlestick"
  const navigate = useNavigate();

  // Top gainers/losers strip logic
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

  // Fetch stocks for main card view, fallback if API fails
  useEffect(() => {
    setLoading(true);
    fetchFinnhubStocks().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setStocks(data.slice(0, 12));
      } else {
        setStocks(fallbackStocks);
      }
      setLoading(false);
    }).catch(() => {
      setStocks(fallbackStocks);
      setLoading(false);
    });
  }, []);

  // Fetch options data (dummy for now)
  useEffect(() => {
    if (focus === "options") {
      fetchOptionData().then(data => setOptions(data?.slice(0, 10) || []));
    }
  }, [focus]);

  // Fetch chart data
  useEffect(() => {
    fetchStockChart(selectedSymbol, timeframe).then(setChartData);
  }, [selectedSymbol, timeframe]);

  // Handle redirect for News and AI Suggestions
  useEffect(() => {
    let timeout;
    if (focus === "news") {
      setRedirecting(true);
      timeout = setTimeout(() => {
        navigate("/nationalnews");
      }, 700);
    } else if (focus === "ai") {
      setRedirecting(true);
      timeout = setTimeout(() => {
        navigate("/aiprediction");
      }, 700);
    } else {
      setRedirecting(false);
    }
    return () => clearTimeout(timeout);
  }, [focus, navigate]);

  // Fetch expanded chart data when expandedStock changes
  useEffect(() => {
    if (expandedStock) {
      fetchStockChart(expandedStock.symbol, expandedTimeframe, expandedChartType).then(setExpandedChartData);
    }
  }, [expandedStock, expandedTimeframe, expandedChartType]);

  // Button fade/expand logic
  const buttonVariants = {
    focused: { opacity: 1, scale: 1.08, zIndex: 2 },
    faded: { opacity: 0.5, scale: 1, zIndex: 1, pointerEvents: "auto" },
    initial: { opacity: 1, scale: 1, zIndex: 1 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-2 sm:p-4 md:p-8 flex flex-col"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
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
        </div>

        {/* Main Buttons */}
        <div className="flex gap-6 justify-center mt-10 mb-8">
          {BUTTONS.map(btn => (
            <motion.button
              key={btn.key}
              className={`px-7 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300
                ${focus === btn.key ? "bg-gradient-to-r from-blue-500 to-green-400 text-white scale-105" : "bg-slate-800 text-blue-200 hover:bg-slate-700"}
              `}
              onClick={() => setFocus(btn.key)}
              variants={buttonVariants}
              animate={focus === btn.key ? "focused" : "faded"}
              initial="initial"
              whileHover={focus !== btn.key ? { scale: 1.04 } : {}}
              style={{ minWidth: 170, pointerEvents: "auto" }}
            >
              {btn.label}
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl px-4">
            <AnimatePresence mode="wait">
              {focus === "stocks" && (
                <motion.div
                  key="stocks"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7"
                >
                  {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                      <span className="text-slate-400 text-lg">Loading stocks...</span>
                    </div>
                  ) : (
                    stocks
                      .filter(stock => !search || stock.symbol.toLowerCase().includes(search.toLowerCase()))
                      .slice(0, 12)
                      .map((stock, idx) => (
                        <motion.div
                          key={stock.symbol}
                          className="bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-700 card-hover relative group overflow-hidden transition-all duration-300"
                          whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)" }}
                          onClick={() => setExpandedStock(stock)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Minimal info for collapsed card */}
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-teal-300 mb-2 tracking-wide">{stock.symbol}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${stock.change >= 0 ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                              {stock.change >= 0 ? "+" : ""}
                              {stock.change}%
                            </span>
                          </div>
                          <div className="text-slate-300 text-sm">
                            Price: <span className="font-medium text-white">₹{stock.price}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-400">AI:</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold
                              ${stock.aiOpinion === "Buy" ? "bg-green-700 text-green-200"
                                : stock.aiOpinion === "Sell" ? "bg-red-700 text-red-200"
                                : "bg-yellow-700 text-yellow-200"}`}>
                              {stock.aiOpinion || "Hold"}
                            </span>
                          </div>
                        </motion.div>
                      ))
                  )}
                </motion.div>
              )}

              {focus === "options" && (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7"
                >
                  {options.length === 0 ? (
                    <div className="col-span-full flex justify-center py-20">
                      <span className="text-slate-400 text-lg">Loading options...</span>
                    </div>
                  ) : (
                    options.map((option, idx) => (
                      <div key={option.symbol + idx} className="bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-blue-300">{option.symbol}</h3>
                          <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">{option.type}</span>
                        </div>
                        <div className="text-slate-300 text-sm space-y-1">
                          <div>Strike: <span className="font-medium text-white">₹{option.strike}</span></div>
                          <div>Last Price: <span className="font-medium text-white">₹{option.lastPrice}</span></div>
                          <div>Volume: <span className="font-medium text-white">{option.volume}</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {focus === "news" && (
                <motion.div
                  key="news"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <span className="text-slate-400 text-lg">Redirecting to News...</span>
                </motion.div>
              )}

              {focus === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <span className="text-slate-400 text-lg">Redirecting to AI Suggestions...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chart Section - only visible when stocks is in focus */}
            {focus === "stocks" && chartData.length > 0 && (
              <div className="mt-10">
                <DarkLineChart
                  data={chartData}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                />
              </div>
            )}
          </div>
        </div>

        {/* Expanded fullscreen overlay */}
        <AnimatePresence>
          {expandedStock && (
            <motion.div
              key="expanded-stock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
              style={{ backdropFilter: "blur(8px)" }}
              onClick={() => setExpandedStock(null)}
            >
              <motion.div
                className="bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-3xl w-full relative"
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                exit={{ y: 40 }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-400 text-3xl z-10"
                  onClick={() => setExpandedStock(null)}
                >
                  &times;
                </button>
                <h2 className="text-3xl font-bold text-teal-300 mb-4">{expandedStock.symbol} Details</h2>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-slate-400 text-xs">Price</div>
                    <div className="text-lg text-white font-semibold">₹{expandedStock.price}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Open</div>
                    <div className="text-lg text-white font-semibold">₹{expandedStock.open}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">High</div>
                    <div className="text-lg text-white font-semibold">₹{expandedStock.high}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Low</div>
                    <div className="text-lg text-white font-semibold">₹{expandedStock.low}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Volume</div>
                    <div className="text-lg text-white font-semibold">{expandedStock.volume}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">AI Opinion</div>
                    <div className={`text-lg font-semibold ${
                      expandedStock.aiOpinion === "Buy" ? "text-green-400"
                      : expandedStock.aiOpinion === "Sell" ? "text-red-400"
                      : "text-yellow-400"
                    }`}>
                      {expandedStock.aiOpinion}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-slate-400 text-sm">Chart Type:</span>
                  <button
                    className={`px-3 py-1 rounded ${expandedChartType === "line" ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-200"}`}
                    onClick={() => setExpandedChartType("line")}
                  >
                    Line
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${expandedChartType === "candlestick" ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-200"}`}
                    onClick={() => setExpandedChartType("candlestick")}
                  >
                    Candles
                  </button>
                </div>
                <div>
                  <DarkLineChart
                    data={expandedChartData}
                    timeframe={expandedTimeframe}
                    setTimeframe={setExpandedTimeframe}
                    type={expandedChartType}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Section */}
        <div className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 text-center">
            Explore FinHub Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Link
                to={f.to}
                key={f.title}
                className={`
                  group bg-gradient-to-br ${f.color} rounded-2xl shadow-xl p-6 flex flex-col items-center
                  hover:scale-[1.03] hover:shadow-2xl transition-all duration-200
                  min-h-[180px] w-full
                `}
              >
                <div className="mb-3">{f.icon}</div>
                <div className="text-xl font-bold text-white mb-2">{f.title}</div>
                <div className="text-slate-100 text-center text-sm">{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} FinHub. All rights reserved.
        </footer>
      </div>

      {/* Marquee animation */}
      <style>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </motion.div>
  );
};

export default Home;
