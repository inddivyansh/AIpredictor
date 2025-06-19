// src/pages/AIPrediction.jsx
import { motion } from 'framer-motion';

const AIPrediction = () => {
  return (
    <motion.div
      className="ml-64 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">AI Predictions</h2>
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        <p className="text-gray-600 mt-6">
          🤖 This section will display AI-generated market predictions based on real-time data and user input. You can plug in your ML models, inference logic, or use a backend service to fetch the results.
        </p>
      </div>
    </motion.div>
  );
};

export default AIPrediction;
