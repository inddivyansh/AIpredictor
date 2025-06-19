// src/pages/Suggestions.jsx
import { motion } from "framer-motion";

const Suggestions = () => {
  return (
    <motion.div
      className="ml-64 p-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-4">AI Suggestions</h2>

      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        <p className="text-gray-600 mt-6">
          🤖 This section is reserved for AI-generated personalized investment suggestions based on your portfolio, risk profile, and market trends. You can inject backend logic or call an AI API here.
        </p>
      </div>
    </motion.div>
  );
};

export default Suggestions;
