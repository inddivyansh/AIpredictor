// src/pages/Portfolio.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const sampleData = [
  { date: 'Mon', value: 5000 },
  { date: 'Tue', value: 5200 },
  { date: 'Wed', value: 5100 },
  { date: 'Thu', value: 5400 },
  { date: 'Fri', value: 5600 },
];

const Portfolio = () => {
  return (
    <motion.div
      className="ml-64 p-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-4">My Portfolio</h2>
      <div className="bg-white p-4 rounded-2xl shadow-md">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampleData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default Portfolio;
