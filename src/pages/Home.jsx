import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Loader from "../components/Loader";
import { fetchMultipleStocks } from "../services/polygonAPI";

const symbols = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "NVDA"];

const Home = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStocks = async () => {
      setLoading(true);
      const data = await fetchMultipleStocks(symbols);
      setStocks(data);
      setLoading(false);
    };

    getStocks();
  }, []);

  return (
    <motion.div
      className="ml-64 p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-3xl font-semibold mb-6 tracking-wide">📈 Market Overview</h2>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {stocks.map((stock) => (
            <div
              key={stock.ticker}
              className="bg-slate-700 bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-md p-5 border border-slate-600 hover:scale-[1.02] transition-all duration-200"
            >
              <h3 className="text-xl font-bold text-teal-300 mb-3 tracking-wide">
                {stock.ticker}
              </h3>
              <p className="text-slate-300 mb-1">📈 Open: <span className="font-medium text-white">{stock.o}</span></p>
              <p className="text-slate-300 mb-1">📉 Close: <span className="font-medium text-white">{stock.c}</span></p>
              <p className="text-slate-300 mb-1">📊 High: <span className="font-medium text-white">{stock.h}</span></p>
              <p className="text-slate-300">🔁 Volume: <span className="font-medium text-white">{stock.v}</span></p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Home;
