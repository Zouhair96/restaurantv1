
import React from 'react';
import { motion } from 'framer-motion';

const LoyaltyProgressBar = ({ loyaltyConfig = {}, isDarkMode = false, currentSpending = null, totalVisits = 0, progressMessage = null }) => {
    // Calculate Spending Progress (Motivational only)
    const totalSpending = parseFloat(currentSpending || 0);
    const threshold = parseFloat(loyaltyConfig?.loyalConfig?.threshold || 50);

    // Percentage for the bar
    const percentage = Math.min((totalSpending / threshold) * 100, 100);

    // Messaging (Authoritative from props or internal fallback)
    const message = progressMessage || "🔥 You're close! Final session before Loyal Rewards!";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border ${isDarkMode
                ? 'bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-700/50'
                : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
                }`}
        >
            {/* Minimal Header info (No Numerical Values) */}
            <div className="flex justify-between items-end mb-2">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Progress
                </p>
            </div>

            {/* Progress Bar */}
            <div className={`w-full h-3 rounded-full overflow-hidden mb-3 ${isDarkMode ? 'bg-white/10' : 'bg-white/60'}`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full"
                    style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)' }}
                />
            </div>

            {/* Message */}
            <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    {message}
                </p>
            </div>
        </motion.div>
    );
};

export default LoyaltyProgressBar;
