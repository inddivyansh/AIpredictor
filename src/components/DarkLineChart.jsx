import ReactECharts from "echarts-for-react";

const timeframes = [
  { label: "1D", value: 1 },
  { label: "1W", value: 7 },
  { label: "1M", value: 30 },
  { label: "6M", value: 180 },
  { label: "1Y", value: 365 },
];

export default function DarkLineChart({ data, timeframe, setTimeframe, type = "line" }) {
  const up = data.length > 1 && data[0].close < data[data.length - 1].close;

  // Candlestick chart config
  const candleOption = {
    backgroundColor: "#0f172a",
    textStyle: { color: "#e5e7eb" },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1e293b",
      borderColor: "#38bdf8",
      textStyle: { color: "#f1f5f9" },
    },
    xAxis: {
      type: "category",
      data: data.map(d => d.time),
      axisLine: { lineStyle: { color: "#64748b" } },
      axisLabel: { color: "#cbd5e1" },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#64748b" } },
      axisLabel: { color: "#cbd5e1" },
      splitLine: { lineStyle: { color: "#334155" } },
    },
    series: [
      {
        type: "candlestick",
        data: data.map(d => [d.open, d.close, d.low, d.high]),
        itemStyle: {
          color: "#22c55e",
          color0: "#ef4444",
          borderColor: "#22c55e",
          borderColor0: "#ef4444",
        },
      },
    ],
  };

  // Line chart config
  const lineOption = {
    backgroundColor: "#0f172a",
    textStyle: { color: "#e5e7eb" },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1e293b",
      borderColor: "#38bdf8",
      textStyle: { color: "#f1f5f9" },
    },
    xAxis: {
      type: "category",
      data: data.map(d => d.time),
      axisLine: { lineStyle: { color: "#64748b" } },
      axisLabel: { color: "#cbd5e1" },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#64748b" } },
      axisLabel: { color: "#cbd5e1" },
      splitLine: { lineStyle: { color: "#334155" } },
    },
    series: [
      {
        data: data.map(d => d.close),
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: up ? "#22c55e" : "#ef4444",
          width: 3,
        },
        areaStyle: {
          color: up
            ? "rgba(34,197,94,0.08)"
            : "rgba(239,68,68,0.08)",
        },
      },
    ],
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        {timeframes.map(tf => (
          <button
            key={tf.value}
            className={`px-2 py-1 rounded ${tf.value === timeframe ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-200"}`}
            onClick={() => setTimeframe(tf.value)}
          >
            {tf.label}
          </button>
        ))}
      </div>
      <ReactECharts
        option={type === "candlestick" ? candleOption : lineOption}
        style={{ height: 320, width: "100%" }}
      />
    </div>
  );
}