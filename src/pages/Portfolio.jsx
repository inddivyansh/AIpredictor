// src/pages/Portfolio.jsx
import { useEffect, useState } from "react";
import { Search, LogIn, UserPlus } from "lucide-react";
import { fetchStockChart, fetchTopGainers, fetchTopLosers } from "../services/finnhubApi";
import DarkLineChart from "../components/DarkLineChart";
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer, Sector } from "recharts";
import { motion } from "framer-motion";

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

const tabList = [
  { key: "value", label: "Portfolio Value" },
  { key: "investment", label: "Total Investment" },
  { key: "profit", label: "Profit / Loss" },
];

const Portfolio = ({ sidebarWidth }) => {
  const [tab, setTab] = useState("value");
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const totalValue = portfolioStocks.reduce((a, b) => a + b.value, 0);
  const totalInvested = portfolioStocks.reduce((a, b) => a + b.invested, 0);
  const totalProfit = totalValue - totalInvested;

  // Custom active shape for pie chart: label outside with arrow pin, no label in center
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx, cy, midAngle, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={0}
          outerRadius={outerRadius + 12}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff"
          strokeWidth={3}
          filter="url(#shadow)"
        />
        {/* Arrow pin and label outside */}
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={4} fill={fill} stroke="white" strokeWidth={2} />
        <text
          x={ex + (cos >= 0 ? 8 : -8)}
          y={ey}
          textAnchor={textAnchor}
          fill="#fff"
          fontSize={15}
          fontWeight={700}
          alignmentBaseline="middle"
        >
          {payload.name}
        </text>
        <text
          x={ex + (cos >= 0 ? 8 : -8)}
          y={ey + 20}
          textAnchor={textAnchor}
          fill="#cbd5e1"
          fontSize={13}
          alignmentBaseline="middle"
        >
          ₹{value.toLocaleString()} ({(percent * 100).toFixed(1)}%)
        </text>
      </g>
    );
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
      <div className="p-2 sm:p-6 md:p-10 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Top Left: Portfolio Summary */}
          <div className="order-1 md:order-1 flex flex-col items-start">
            <div className="bg-slate-900 bg-opacity-90 rounded-2xl shadow p-5 w-full max-w-xs">
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
              <div className="text-slate-300 text-sm">
                <span className="font-semibold">Most Invested:</span>{" "}
                <span className="text-blue-400">
                  {portfolioStocks.reduce((max, s) => (s.invested > (max?.invested ?? -Infinity) ? s : max), null)?.ticker || "-"}
                </span>
              </div>
            </div>
          </div>
          {/* Top Right: Stock Trend */}
          <div className="order-3 md:order-2 flex flex-col items-center">
            <div className="bg-slate-900 bg-opacity-90 rounded-2xl shadow p-4 flex flex-col items-center w-full">
              <h3 className="text-base font-semibold mb-2 text-green-300">Stock Trend</h3>
              <div className="w-full min-w-[120px]">
                <DarkLineChart
                  data={chartData}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                />
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Showing: <span className="font-semibold">{selectedSymbol}</span>
              </div>
            </div>
          </div>
          {/* Bottom Left: Pie Chart */}
          <div className="order-2 md:order-3 flex flex-col items-center">
            <div className="bg-slate-900 bg-opacity-90 rounded-2xl shadow p-4 flex flex-col items-center w-full mb-6">
              <h3 className="text-base font-semibold mb-2 text-blue-300">Sector Allocation</h3>
              <ResponsiveContainer width="100%" minWidth={200} height={260}>
                <PieChart>
                  <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
                    </filter>
                  </defs>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    fill="#38bdf8"
                    dataKey="value"
                    onMouseEnter={(_, idx) => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(-1)}
                    paddingAngle={2}
                    label={false}
                  >
                    {sectorData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                        opacity={activeIndex === -1 || activeIndex === idx ? 1 : 0.25}
                        style={{ transition: "opacity 0.3s" }}
                      />
                    ))}
                  </Pie>
                  <PieTooltip
                    wrapperStyle={{ zIndex: 1000 }}
                    content={({ active, payload }) =>
                      active && payload && payload.length ? (
                        <div className="bg-slate-800 text-slate-100 p-2 rounded shadow">
                          <div className="font-semibold">{payload[0].name}</div>
                          <div>₹{payload[0].value.toLocaleString()}</div>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Bottom Right: Table */}
          <div className="order-4 md:order-4 flex flex-col min-w-0">
            <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/60 mb-6">
              <table className="w-full text-sm table-fixed">
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
                        <td className="py-2 pl-4 font-semibold cursor-pointer truncate text-left" onClick={() => setSelectedSymbol(s.ticker)}>
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
    </motion.div>
  );
};

export default Portfolio;