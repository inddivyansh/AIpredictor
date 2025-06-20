const API_KEY = "d1aj3ipr01qltin1oc5gd1aj3ipr01qltin1oc60";
const BASE_URL = "https://finnhub.io/api/v1";

// Fetch live stock quote for a symbol
export async function fetchStockQuote(symbol) {
  const res = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
  return await res.json();
}

// Fetch historical candles for a symbol and timeframe
export async function fetchStockChart(symbol, days = 1) {
  const now = Math.floor(Date.now() / 1000);
  const from = now - days * 24 * 60 * 60;
  // Resolution: 1 = 1D, 7 = 1W, 30 = 1M, 180 = 6M, 365 = 1Y
  let resolution = "D";
  if (days <= 1) resolution = "5";
  else if (days <= 7) resolution = "30";
  else if (days <= 30) resolution = "60";
  const url = `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.c) return [];
  return data.c.map((close, i) => ({
    close,
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    volume: data.v[i],
    time: new Date(data.t[i] * 1000).toLocaleDateString(),
  }));
}

// Fetch top gainers from NSE (Indian market, INR)
export async function fetchTopGainers() {
  const res = await fetch(`${BASE_URL}/stock/symbol?exchange=NSE&token=${API_KEY}`);
  const symbols = await res.json();
  const quotes = await Promise.all(
    symbols.slice(0, 50).map(async s => {
      const q = await fetch(`${BASE_URL}/quote?symbol=${s.symbol}&token=${API_KEY}`).then(r => r.json());
      return { symbol: s.symbol, ...q };
    })
  );
  const gainers = quotes
    .map(q => ({
      symbol: q.symbol,
      change: q.c && q.pc ? (((q.c - q.pc) / q.pc) * 100).toFixed(2) : 0,
      price: q.c,
      open: q.o,
      high: q.h,
      low: q.l,
      volume: q.v,
      prevClose: q.pc,
    }))
    .sort((a, b) => b.change - a.change)
    .slice(0, 10);
  return gainers;
}

// Fetch top losers from NSE (Indian market, INR)
export async function fetchTopLosers() {
  const res = await fetch(`${BASE_URL}/stock/symbol?exchange=NSE&token=${API_KEY}`);
  const symbols = await res.json();
  const quotes = await Promise.all(
    symbols.slice(0, 50).map(async s => {
      const q = await fetch(`${BASE_URL}/quote?symbol=${s.symbol}&token=${API_KEY}`).then(r => r.json());
      return { symbol: s.symbol, ...q };
    })
  );
  const losers = quotes
    .map(q => ({
      symbol: q.symbol,
      change: q.c && q.pc ? (((q.c - q.pc) / q.pc) * 100).toFixed(2) : 0,
      price: q.c,
      open: q.o,
      high: q.h,
      low: q.l,
      volume: q.v,
      prevClose: q.pc,
    }))
    .sort((a, b) => a.change - b.change)
    .slice(0, 10);
  return losers;
}

// Fetch 12 Indian stocks with details for main card view (NSE, INR)
export async function fetchFinnhubStocks() {
  const res = await fetch(`${BASE_URL}/stock/symbol?exchange=NSE&token=${API_KEY}`);
  const symbols = await res.json();
  const selected = symbols.slice(0, 12);
  const stocks = await Promise.all(
    selected.map(async s => {
      const q = await fetch(`${BASE_URL}/quote?symbol=${s.symbol}&token=${API_KEY}`).then(r => r.json());
      const aiOpinion = ["Buy", "Sell", "Hold"][Math.floor(Math.random() * 3)];
      return {
        symbol: s.symbol,
        price: q.c,
        open: q.o,
        high: q.h,
        low: q.l,
        volume: q.v,
        change: q.c && q.pc ? (((q.c - q.pc) / q.pc) * 100).toFixed(2) : 0,
        aiOpinion,
        currency: "₹",
      };
    })
  );
  return stocks;
}

// Fetch dummy options data (Finnhub options API is premium, so this is a placeholder)
export async function fetchOptionData() {
  // Dummy data for demo
  return [
    {
      symbol: "RELIANCE",
      type: "CALL",
      strike: 3000,
      expiry: "2025-07-18",
      lastPrice: 52.2,
      volume: 120,
      currency: "₹",
    },
    {
      symbol: "TCS",
      type: "PUT",
      strike: 4000,
      expiry: "2025-07-18",
      lastPrice: 78.8,
      volume: 80,
      currency: "₹",
    },
    // ...add more as needed
  ];
}

export async function fetchBusinessNews(region = "IN", count = 10) {
  const API_KEY = "d1aj3ipr01qltin1oc5gd1aj3ipr01qltin1oc60";
  const url = `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`;
  const res = await fetch(url);
  const allNews = await res.json();
  // Filter for business/finance/stock market topics
  const filtered = allNews.filter(
    n =>
      /business|finance|stock|market|invest|econom/i.test(n.headline + n.summary) &&
      n.image &&
      n.headline &&
      n.summary
  );
  return filtered.slice(0, count);
}