// src/pages/AIPrediction.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchTopGainers, fetchTopLosers, fetchBusinessNews } from "../services/finnhubApi";
import { Search, LogIn, UserPlus } from "lucide-react";
import Sentiment from "sentiment";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { useNavigate } from "react-router-dom";

const COLORS = ["#38bdf8", "#facc15", "#f87171"];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  // Increase label radius and ResponsiveContainer size for more space
  const labelRadius = outerRadius + 48;
  let labelX = cx + labelRadius * cos;
  let labelY = cy + labelRadius * (sin < 0 ? sin : -0.7);

  // Clamp label to chart area (wider/taller)
  const chartWidth = 320;
  const chartHeight = 260;
  labelX = Math.max(16, Math.min(chartWidth - 16, labelX));
  labelY = Math.max(28, Math.min(chartHeight - 16, labelY));

  return (
    <g>
      {/* Main sector with a little scale up for spotlight */}
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
        filter="url(#shadow)"
      />
      {/* Leader line and dot */}
      <path d={`M${cx + outerRadius * cos},${cy + outerRadius * sin}L${labelX},${labelY}`} stroke={fill} strokeWidth={2.2} fill="none" />
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
        style={{ textShadow: "0 2px 8px #000, 0 0 2px #000", pointerEvents: "none" }}
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
        style={{ textShadow: "0 2px 8px #000, 0 0 2px #000", pointerEvents: "none" }}
      >
        {value} articles ({(percent * 100).toFixed(1)}%)
      </text>
    </g>
  );
};

const AIPrediction = ({ sidebarWidth }) => {
  const [stripType, setStripType] = useState("gainers");
  const [stripData, setStripData] = useState([]);
  const [search, setSearch] = useState("");
  const [sentimentData, setSentimentData] = useState([
    { name: "Positive", value: 0 },
    { name: "Neutral", value: 0 },
    { name: "Negative", value: 0 },
  ]);
  const [sentimentInsights, setSentimentInsights] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();

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

  // --- MAIN CHANGE: Pie chart distribution based on national news sentiment ---
  useEffect(() => {
    fetchBusinessNews("IN", 30).then(news => {
      const sentiment = new Sentiment();
      let pos = 0, neu = 0, neg = 0;
      const insights = news.map(article => {
        const score = sentiment.analyze(article.summary).score;
        if (score > 1) pos++;
        else if (score < -1) neg++;
        else neu++;
        return { ...article, sentiment: score };
      });
      setSentimentInsights(insights);
      setSentimentData([
        { name: "Positive", value: pos },
        { name: "Neutral", value: neu },
        { name: "Negative", value: neg },
      ]);
      // Example: Generate suggestions based on sentiment
      const portfolio = ["XOM", "AAPL", "BP"];
      const sugg = portfolio.map(stock => {
        const related = insights.filter(a => a.headline.includes(stock));
        const avg = related.length
          ? related.reduce((a, b) => a + b.sentiment, 0) / related.length
          : 0;
        return {
          stock,
          action: avg > 1 ? "Buy More" : avg < -1 ? "Sell" : "Hold",
          reason: `Avg sentiment: ${avg.toFixed(2)} from news analysis.`,
        };
      });
      setSuggestions(sugg);
    });
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
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
      <div className="mt-6 px-2 sm:px-4 md:px-8">
        <h2 className="text-3xl font-bold mb-6 tracking-wide">💡 AI Prediction</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 bg-opacity-80 rounded-2xl shadow-md p-6 flex flex-col items-center min-h-[320px]">
            <h3 className="text-lg font-semibold mb-4 text-green-300">Market Sentiment</h3>
            <div className="w-full flex justify-center items-center mb-4">
              <ResponsiveContainer width={320} height={260}>
                <PieChart>
                  <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
                    </filter>
                  </defs>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx={160}
                    cy={120}
                    outerRadius={90}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, idx) => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(-1)}
                    onClick={(_, idx) => {
                      const sentimentMap = ["positive", "neutral", "negative"];
                      navigate(`/nationalnews?sentiment=${sentimentMap[idx]}`);
                    }}
                    style={{ cursor: "pointer" }}
                    paddingAngle={2}
                    label={false}
                    isAnimationActive={true}
                    animationDuration={400}
                  >
                    {sentimentData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
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
            <div className="mt-2 text-sm text-slate-300 text-center">
              {sentimentData[0].value > sentimentData[2].value
                ? "Positive sentiment dominates the current market outlook."
                : sentimentData[2].value > sentimentData[0].value
                ? "Negative sentiment is currently stronger in the market."
                : "Market sentiment is mostly neutral."}
            </div>
          </div>
          <div className="bg-slate-800 bg-opacity-80 rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Actionable Suggestions</h3>
            <ul className="space-y-4">
              {suggestions.map((s, idx) => (
                <li key={idx} className="p-4 rounded-xl bg-slate-700/60">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">{s.stock}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      s.action === "Buy More" ? "bg-green-600 text-white" :
                      s.action === "Hold" ? "bg-yellow-500 text-white" :
                      "bg-red-600 text-white"
                    }`}>
                      {s.action}
                    </span>
                  </div>
                  <div className="text-sm text-slate-200">{s.reason}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIPrediction;
