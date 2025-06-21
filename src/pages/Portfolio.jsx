// src/pages/Portfolio.jsx
import { useEffect, useState } from "react";
import { Search, LogIn, UserPlus, Maximize2, X } from "lucide-react";
import { fetchStockChart, fetchTopGainers, fetchTopLosers } from "../services/finnhubApi";
import DarkLineChart from "../components/DarkLineChart";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const portfolioStocks = [
  { ticker: "XOM", name: "Exxon Mobil", sector: "Energy", value: 3200, invested: 2500, profit: 700 },
  { ticker: "BP", name: "BP plc", sector: "Energy", value: 2100, invested: 2000, profit: 100 },
  { ticker: "TATASTEEL", name: "Tata Steel", sector: "Materials", value: 1500, invested: 1200, profit: 300 },
  { ticker: "RELIANCE", name: "Reliance", sector: "Energy", value: 2800, invested: 2500, profit: 300 },
  { ticker: "AAPL", name: "Apple", sector: "Tech", value: 1800, invested: 1500, profit: 300 },
  { ticker: "INFY", name: "Infosys", sector: "Tech", value: 1200, invested: 1000, profit: 200 },
  { ticker: "L&T", name: "Larsen & Toubro", sector: "Construction", value: 900, invested: 800, profit: 100 },
];

const COLORS = ["#38bdf8", "#facc15", "#34d399", "#f472b6", "#818cf8", "#f87171", "#fbbf24"];

const sectorData = Object.values(
  portfolioStocks.reduce((acc, stock) => {
    acc[stock.sector] = acc[stock.sector] || { name: stock.sector, value: 0 };
    acc[stock.sector].value += stock.value;
    return acc;
  }, {})
);

const Portfolio = ({ sidebarWidth }) => {
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTrendFullscreen, setIsTrendFullscreen] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

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
    fetchStockChart(selectedSymbol, timeframe).then(setChartData);
  }, [selectedSymbol, timeframe]);

  // Calculate totals
  const totalInvested = portfolioStocks.reduce((sum, s) => sum + s.invested, 0);
  const totalValue = portfolioStocks.reduce((sum, s) => sum + s.value, 0);
  const totalPL = portfolioStocks.reduce((sum, s) => sum + s.profit, 0);

  // --- PIE CHART: 2D, spotlight glow and label only on hover ---
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx, cy, midAngle, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);

    // Label position (outside, with leader line)
    const labelRadius = outerRadius + 36;
    let labelX = cx + labelRadius * cos;
    let labelY = cy + labelRadius * (sin < 0 ? sin : -0.7);

    // Clamp label to chart area
    const chartWidth = 260;
    const chartHeight = 220;
    labelX = Math.max(10, Math.min(chartWidth - 10, labelX));
    labelY = Math.max(20, Math.min(chartHeight - 10, labelY));

    return (
      <g>
        {/* Main sector with glowing spotlight */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={0}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff"
          strokeWidth={3}
          style={{
            filter: "drop-shadow(0 0 16px #fff8), drop-shadow(0 0 8px " + fill + ")"
          }}
        />
        {/* Leader line and dot */}
        <path
          d={`M${cx + outerRadius * cos},${cy + outerRadius * sin}L${labelX},${labelY}`}
          stroke={fill}
          strokeWidth={2.2}
          fill="none"
        />
        <circle cx={labelX} cy={labelY} r={6} fill="#181e3a" stroke={fill} strokeWidth={3} />
        {/* Label */}
        <text
          x={labelX}
          y={labelY - 12}
          textAnchor="middle"
          fill="#fff"
          fontSize={15}
          fontWeight={700}
          alignmentBaseline="bottom"
          style={{ textShadow: "0 2px 8px #000, 0 0 2px #000" }}
        >
          {payload.name}
        </text>
        <text
          x={labelX}
          y={labelY + 12}
          textAnchor="middle"
          fill="#b5e3ff"
          fontSize={13}
          alignmentBaseline="hanging"
          style={{ textShadow: "0 2px 8px #000, 0 0 2px #000" }}
        >
          ₹{value.toLocaleString()} ({(percent * 100).toFixed(1)}%)
        </text>
      </g>
    );
  };

  // Helper to shade color for 3D side wall
  function shadeColor(color, percent) {
    // color: "#38bdf8" or "#facc15"
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);
    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);
    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  
    const RR = ((R.toString(16).length===1)?"0":"") + R.toString(16);
    const GG = ((G.toString(16).length===1)?"0":"") + G.toString(16);
    const BB = ((B.toString(16).length===1)?"0":"") + B.toString(16);
    return "#"+RR+GG+BB;
  }

  // When a stock is clicked, show the trend in fullscreen
  const handleStockClick = (ticker) => {
    setSelectedSymbol(ticker);
    setShowTrend(true);
    setIsTrendFullscreen(true);
  };

  // Hide trend when modal closes
  const handleCloseTrend = () => {
    setIsTrendFullscreen(false);
    setTimeout(() => setShowTrend(false), 300); // Wait for animation
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
              placeholder="Search stocks..."
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
        {/* Info Buttons Row */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl px-4 py-4 flex flex-col items-center shadow border border-slate-700">
            <span className="text-xs text-slate-400 mb-1">Total Invested</span>
            <span className="text-lg font-bold text-blue-400">₹{totalInvested.toLocaleString()}</span>
          </div>
          <div className="bg-slate-800 rounded-xl px-4 py-4 flex flex-col items-center shadow border border-slate-700">
            <span className="text-xs text-slate-400 mb-1">Current Value</span>
            <span className="text-lg font-bold text-green-400">₹{totalValue.toLocaleString()}</span>
          </div>
          <div className="bg-slate-800 rounded-xl px-4 py-4 flex flex-col items-center shadow border border-slate-700">
            <span className="text-xs text-slate-400 mb-1">Current P/L</span>
            <span className={`text-lg font-bold ${totalPL >= 0 ? "text-green-400" : "text-red-400"}`}>
              ₹{totalPL.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Main Content: Portfolio Summary + Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Left: Portfolio Summary & Pie */}
          <div className="flex flex-col items-start w-full">
            <div className="bg-slate-900 bg-opacity-90 rounded-2xl shadow p-4 sm:p-6 w-full">
              <h3 className="text-base font-semibold mb-2 text-yellow-300 flex items-center gap-2">
                <span>Portfolio Summary</span>
                <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full">
                  {portfolioStocks.length} Stocks
                </span>
              </h3>
              <div className="text-slate-300 text-sm mb-2">
                <span className="font-semibold">Best Performer:</span>{" "}
                <span className="text-green-400">
                  {portfolioStocks.reduce((best, s) => (s.profit > (best?.profit ?? -Infinity) ? s : best), null)?.ticker || "-"}
                </span>
              </div>
              <div className="text-slate-300 text-sm mb-2">
                <span className="font-semibold">Worst Performer:</span>{" "}
                <span className="text-red-400">
                  {portfolioStocks.reduce((worst, s) => (s.profit < (worst?.profit ?? Infinity) ? s : worst), null)?.ticker || "-"}
                </span>
              </div>
              <div className="text-slate-300 text-sm mb-4">
                <span className="font-semibold">Most Invested:</span>{" "}
                <span className="text-blue-400">
                  {portfolioStocks.reduce((max, s) => (s.invested > (max?.invested ?? -Infinity) ? s : max), null)?.ticker || "-"}
                </span>
              </div>
              {/* Sectors Invested Pie Chart */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-blue-300 mb-2">Sectors Invested</h4>
                <div className="w-full flex items-center justify-center">
                  <ResponsiveContainer width={260} height={220}>
                    <PieChart>
                      <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
                        </filter>
                      </defs>
                      <Pie
                        data={sectorData}
                        cx={130}
                        cy={110}
                        innerRadius={0}
                        outerRadius={70}
                        fill="#38bdf8"
                        dataKey="value"
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, idx) => setActiveIndex(idx)}
                        onMouseLeave={() => setActiveIndex(-1)}
                        paddingAngle={2}
                        label={false}
                        isAnimationActive={true}
                        animationDuration={400}
                      >
                        {sectorData.map((entry, idx) => (
                          <Cell
                            key={`cell-summary-${idx}`}
                            fill={COLORS[idx % COLORS.length]}
                            opacity={activeIndex === -1 || activeIndex === idx ? 1 : 0.18}
                            style={{
                              filter: activeIndex === idx ? "drop-shadow(0 0 8px #fff8)" : "none",
                              transition: "opacity 0.4s cubic-bezier(.4,2,.6,1), filter 0.4s cubic-bezier(.4,2,.6,1)"
                            }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Table */}
          <div className="flex flex-col min-w-0 w-full">
            <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/60 mb-6">
              <table className="w-full min-w-[400px] text-sm table-fixed">
                <colgroup>
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "18%" }} />
                </colgroup>
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-2 pl-4 text-left">Stock</th>
                    <th className="text-left">Sector</th>
                    <th className="text-right">Value</th>
                    <th className="text-right">Invested</th>
                    <th className="pr-4 text-right">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioStocks
                    .filter(s => !search || s.ticker.toLowerCase().includes(search.toLowerCase()))
                    .map(s => (
                      <tr key={s.ticker} className="border-b border-slate-700 hover:bg-slate-700/30">
                        <td className="py-2 pl-4 font-semibold cursor-pointer truncate text-left" onClick={() => handleStockClick(s.ticker)}>
                          <span className={selectedSymbol === s.ticker ? "underline text-blue-400" : ""}>{s.ticker}</span>
                        </td>
                        <td className="truncate text-left">{s.sector}</td>
                        <td className="truncate text-right">₹{s.value}</td>
                        <td className="truncate text-right">₹{s.invested}</td>
                        <td className={`truncate pr-4 text-right ${s.profit >= 0 ? "text-green-400" : "text-red-400"}`}>₹{s.profit}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Stock Trend Modal */}
      <AnimatePresence>
        {showTrend && isTrendFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backdropFilter: "blur(4px)" }}
          >
            <motion.div
              className="bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-3xl relative flex flex-col items-center"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-red-400 text-2xl"
                onClick={handleCloseTrend}
                title="Close"
              >
                <X size={28} />
              </button>
              {/* Always show stock name above chart */}
              <div className="w-full flex flex-col items-center mb-2">
                <span className="text-2xl font-bold text-blue-300 tracking-wide mb-1" style={{ wordBreak: "break-all" }}>
                  {selectedSymbol}
                </span>
                <span className="text-xs text-slate-400 mb-2">Stock Trend</span>
              </div>
              <div className="w-full h-[340px]">
                <DarkLineChart
                  data={chartData}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Portfolio;