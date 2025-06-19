// src/pages/NationalNews.jsx
import { motion } from 'framer-motion';

const NationalNews = () => {
  const dummyNews = [
    {
      title: "RBI Holds Repo Rate Steady",
      summary: "The Reserve Bank of India decided to maintain the repo rate amid inflation concerns.",
    },
    {
      title: "Finance Minister Reviews Economic Growth",
      summary: "The FM held meetings with economists to plan strategies for the next quarter.",
    },
    {
      title: "Stock Markets Close Higher",
      summary: "Sensex and Nifty ended in green driven by banking and IT stocks.",
    },
  ];

  return (
    <motion.div
      className="ml-64 p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-4">National News</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {dummyNews.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.summary}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default NationalNews;
