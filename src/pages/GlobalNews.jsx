// src/pages/GlobalNews.jsx
import { motion } from 'framer-motion';

const GlobalNews = () => {
  const headlines = [
    {
      title: "Global Markets Rally",
      summary: "Stocks rose globally as investors grew optimistic about soft landing hopes.",
    },
    {
      title: "China Exports Rebound",
      summary: "Surprising surge in Chinese exports boosts commodity-linked currencies.",
    },
    {
      title: "Tech Stocks Lead Wall Street",
      summary: "Big tech gains lifted US indexes despite broader recession concerns.",
    },
  ];

  return (
    <motion.div
      className="ml-64 p-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-4">Global News</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {headlines.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.summary}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default GlobalNews;
