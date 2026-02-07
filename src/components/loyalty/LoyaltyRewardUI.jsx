import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiGift, HiChevronRight, HiSparkles, HiXMark } from 'react-icons/hi2';
import { useLoyalty } from '../../context/LoyaltyContext';
import { useLanguage } from '../../context/LanguageContext';
import { getLoyaltyMessage, LOYALTY_MESSAGE_KEYS } from '../../translations/loyaltyMessages';

const LoyaltyRewardUI = ({ restaurantName, themeColor = '#f97316', isDarkMode = false }) => {
    const { getStatus, convertGift } = useLoyalty();
    const { language: currentLanguage } = useLanguage();
    const loyaltyInfo = getStatus(restaurantName);
    const [isConverting, setIsConverting] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const activeGifts = loyaltyInfo?.activeGifts || [];
    const config = loyaltyInfo?.config || {};
    const uiState = loyaltyInfo?.uiState || 'ACTIVE_EARNING'; // Default fallback

    // Content Generators based on State
    const renderContent = () => {
        switch (uiState) {
            case 'WELCOME':
                return {
                    icon: '👋',
                    title: getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.SESSION_1_BEFORE_ORDER, currentLanguage) || 'Welcome!',
                    subtitle: getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.SESSION_1_AFTER_ORDER, currentLanguage) || 'Join us to earn rewards',
                    action: null
                };

            case 'GIFT_AVAILABLE':
                // Use first gift or fallback 10%
                const gift = activeGifts.length > 0 ? activeGifts[0] : { type: 'PERCENTAGE', percentage_value: 10 };
                const isPercentage = gift.type === 'PERCENTAGE';
                const valueDisplay = isPercentage ? `${gift.percentage_value}%` : `${gift.euro_value}€`;

                return {
                    icon: '🎁',
                    title: getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER, currentLanguage, { percentage: gift.percentage_value || 10 }) || 'Welcome Back!',
                    subtitle: getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.SESSION_2_AFTER_ORDER, currentLanguage) || 'Valid for this session',
                    action: 'Use Gift',
                    giftId: gift.id || 'fallback'
                };

            case 'POINTS_PROGRESS':
                return {
                    icon: '⭐',
                    title: getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.SESSION_3_PROGRESS, currentLanguage) || 'Keep earning!',
                    subtitle: 'You are getting closer to a reward',
                    action: null
                };

            case 'ACTIVE_EARNING':
            default:
                // Silent state or simple badge - User said "Zero blank screens", so we show a small loyal badge
                return {
                    icon: '💎',
                    title: getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.LOYAL_ACTIVE, currentLanguage) || 'Loyal Member',
                    subtitle: 'Earn points with every order',
                    action: null
                };
        }
    };

    const content = renderContent();

    if (!content) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-full max-w-sm px-4">
            <AnimatePresence>
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.9 }}
                    className={`p-5 rounded-[2rem] border shadow-2xl overflow-hidden relative ${isDarkMode ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-100'}`}
                    style={{ borderBottom: `4px solid ${themeColor}` }}
                >
                    <button
                        onClick={() => setDismissed(true)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
                            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                        >
                            {content.icon}
                        </div>
                        <div>
                            <h3 className={`font-black text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {content.title}
                            </h3>
                            <p className="text-sm font-bold text-gray-400">
                                {content.subtitle}
                            </p>
                        </div>
                    </div>

                    {content.action && (
                        <div className="flex gap-3">
                            <button
                                className="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
                                style={{ backgroundColor: themeColor }}
                                onClick={() => window.dispatchEvent(new CustomEvent('openCheckout'))}
                            >
                                {content.action}
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default LoyaltyRewardUI;
