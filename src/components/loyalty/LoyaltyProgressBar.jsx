import React from 'react';
import { motion } from 'framer-motion';

const LoyaltyProgressBar = ({ completedOrders = [], loyaltyConfig = {}, isDarkMode = false }) => {
    // Calculate Spending Progress
    const totalSpending = completedOrders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0);
    const threshold = parseFloat(loyaltyConfig?.loyalConfig?.threshold || 50);

    // Cap percentage at 100%
    const percentage = Math.min((totalSpending / threshold) * 100, 100);
    const amountLeft = Math.max(0, threshold - totalSpending);

    // Determine message based on Spending
    const getMessage = () => {
        if (completedOrders.length === 0) {
            return "👋 Place your first order to start unlocking rewards!";
        }
        if (percentage >= 100) {
            return "🎉 Loyal status unlocked! Enjoy your reward!";
        }
        return `🎯 Keep going! Spend €${amountLeft.toFixed(2)} more to unlock rewards!`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border ${isDarkMode
                ? 'bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-700/50'
                : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
                }`}
        >
            {/* Progress Bar */}
            <div className={`w-full h-3 rounded-full overflow-hidden mb-3 ${isDarkMode ? 'bg-white/10' : 'bg-white/60'
                }`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full"
                    style={{
                        boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)'
                    }}
                />
            </div>

            {/* Message */}
            <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'
                    }`}>
                    {getMessage()}
                </p>
            </div>
        </motion.div>
    );
};

export default LoyaltyProgressBar;
