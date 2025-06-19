// src/pages/Impact.jsx
import { motion } from 'framer-motion';

const Impact = () => {
  const impacts = [
    {
      title: "Inflation Rise",
      description: "Consumer price index rose 0.5% this month affecting food and fuel costs.",
    },
    {
      title: "Crude Oil Impact",
      description: "Rising crude oil prices expected to affect logistics and transportation sectors.",
    },
    {
      title: "Fed Policy Change",
      description: "Changes in US interest rates influencing global investor sentiment.",
    },
  ];

  return (
    <motion.div
      className="ml-64 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">Market Impact Analysis</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {impacts.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-blue-700 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-700">{item.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Impact;
