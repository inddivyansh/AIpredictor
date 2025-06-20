import { motion } from "framer-motion";
import { User, Bell, Lock } from "lucide-react";

const Settings = () => {
  return (
    <motion.div
      className="p-4 sm:p-8 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-3xl font-bold mb-8 text-green-400 flex items-center gap-2">
        <Lock size={28} className="text-blue-400" /> Settings
      </h2>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl shadow-xl p-8 space-y-10 border-2 border-green-500">
        {/* Profile Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <User size={20} className="text-blue-300" />
            <h3 className="text-lg font-semibold text-blue-300">Profile</h3>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-slate-400 text-sm">Name</label>
              <input
                className="bg-slate-800 border border-green-500 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-400 transition"
                value="Aarav Sharma"
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-slate-400 text-sm">Email</label>
              <input
                className="bg-slate-800 border border-green-500 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-400 transition"
                value="aarav.sharma@email.com"
                readOnly
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8 mt-4">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-slate-400 text-sm">Phone</label>
              <input
                className="bg-slate-800 border border-green-500 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-400 transition"
                value="+91 98765 43210"
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-slate-400 text-sm">Location</label>
              <input
                className="bg-slate-800 border border-green-500 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-400 transition"
                value="Mumbai, India"
                readOnly
              />
            </div>
          </div>
        </section>
        {/* Preferences Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={20} className="text-blue-300" />
            <h3 className="text-lg font-semibold text-blue-300">Preferences</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-green-500 w-5 h-5" checked readOnly />
              <span className="text-slate-200">Enable notifications</span>
            </label>
          </div>
        </section>
        {/* Security Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lock size={20} className="text-blue-300" />
            <h3 className="text-lg font-semibold text-blue-300">Security</h3>
          </div>
          <button className="bg-gradient-to-r from-green-700 to-green-500 hover:from-green-800 hover:to-green-600 text-white px-6 py-2 rounded-lg transition font-semibold shadow border-2 border-green-500">
            Change Password
          </button>
        </section>
      </div>
    </motion.div>
  );
};

export default Settings;