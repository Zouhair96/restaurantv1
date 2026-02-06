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
    const [isConverting, setIsConverting] = useState(null); // stores giftId being converted
    const [dismissed, setDismissed] = useState(false);

    const activeGifts = loyaltyInfo?.activeGifts || [];
    const config = loyaltyInfo?.config || {};
    const giftConversionEnabled = config.gift_conversion_enabled;

    if (activeGifts.length === 0 || dismissed) return null;

    const handleConvert = async (giftId) => {
        setIsConverting(giftId);
        const result = await convertGift(restaurantName, giftId);
        setIsConverting(null);
        if (result.success) {
            // Succession message could be added here
        }
    };

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-full max-w-sm px-4">
            <AnimatePresence>
                {activeGifts.map((gift, idx) => (
                    <motion.div
                        key={gift.id}
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.9 }}
                        className={`p-5 rounded-[2rem] border shadow-2xl overflow-hidden relative ${isDarkMode ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-100'
                            }`}
                        style={{ borderBottom: `4px solid ${themeColor}` }}
                    >
                        {/* Dismiss Button */}
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
                                🎁
                            </div>
                            <div>
                                <h3 className={`font-black text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    You received a reward!
                                </h3>
                                <p className="text-sm font-bold text-gray-400">
                                    Valid for this session
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                className="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
                                style={{ backgroundColor: themeColor }}
                                onClick={() => {
                                    // Clicking "Use Gift" might just scroll to checkout or open it
                                    window.dispatchEvent(new CustomEvent('openCheckout'));
                                }}
                            >
                                Use Gift
                            </button>

                            {giftConversionEnabled && (
                                <button
                                    disabled={isConverting === gift.id}
                                    className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest border-2 active:scale-95 transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'border-white/10 text-white' : 'border-gray-100 text-gray-900'
                                        }`}
                                    onClick={() => {
                                        const ppe = config.points_per_euro || 1;
                                        const pointsValue = Math.floor(parseFloat(gift.euro_value) * ppe);
                                        const confirmMessage = getLoyaltyMessage(
                                            LOYALTY_MESSAGE_KEYS.GIFT_CONVERSION_CONFIRM,
                                            currentLanguage,
                                            { points: pointsValue }
                                        );
                                        if (window.confirm(confirmMessage || `Convert to ${pointsValue} points? This action is irreversible.`)) {
                                            handleConvert(gift.id);
                                        }
                                    }}
                                >
                                    {isConverting === gift.id ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <HiSparkles className="w-4 h-4" />
                                            {`To ${Math.floor(parseFloat(gift.euro_value) * (config.points_per_euro || 1))} Points`}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {!giftConversionEnabled && (
                            <p className="mt-3 text-[10px] font-black uppercase tracking-tighter text-gray-400 text-center">
                                * Applied automatically to your order
                            </p>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default LoyaltyRewardUI;
