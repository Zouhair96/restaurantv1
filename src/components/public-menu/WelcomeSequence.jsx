import React, { useState, useEffect } from 'react';
import { HiXMark, HiGift, HiStar } from 'react-icons/hi2';
import { translations } from '../../translations';

const WelcomeSequence = ({ restaurantName, themeColor = '#f97316', language = 'fr' }) => {
    const [phase, setPhase] = useState('loading'); // 'loading', 'popup', 'hidden'
    const [isVisible, setIsVisible] = useState(false);

    const lang = language.toLowerCase();
    const t = translations[lang]?.auth?.checkout || translations['fr']?.auth?.checkout;

    useEffect(() => {
        // Initial Loading Phase (2.5 seconds)
        const loadingTimer = setTimeout(() => {
            setPhase('popup');
            setIsVisible(true);
        }, 2500);

        return () => clearTimeout(loadingTimer);
    }, []);

    useEffect(() => {
        if (phase === 'popup') {
            // Auto-hide popup after 5 seconds
            const popupTimer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(popupTimer);
        }
    }, [phase]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => setPhase('hidden'), 500); // Wait for transition
    };

    if (phase === 'hidden') return null;

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none">
            {/* Phase 1: Premium Loading Page */}
            {phase === 'loading' && (
                <div className="absolute inset-0 bg-white dark:bg-[#0a0a0b] flex flex-col items-center justify-center pointer-events-auto z-[210] animate-fade-in">
                    <div className="relative">
                        {/* Orbiting rings */}
                        <div className="absolute inset-0 -m-8 border-4 border-gray-100 dark:border-white/5 rounded-full"></div>
                        <div className="absolute inset-0 -m-8 border-4 border-transparent rounded-full animate-spin-slow" style={{ borderTopColor: themeColor }}></div>

                        <div
                            className="w-24 h-24 rounded-3xl shadow-2xl flex items-center justify-center relative bg-white dark:bg-white/5 overflow-hidden"
                            style={{ boxShadow: `0 20px 40px -10px ${themeColor}40` }}
                        >
                            <HiStar className="w-12 h-12 animate-pulse" style={{ color: themeColor }} />
                        </div>
                    </div>

                    <div className="mt-12 text-center space-y-3">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter opacity-0 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
                            {restaurantName}
                        </h2>
                        <div className="flex gap-1 justify-center opacity-0 animate-slide-up-fade" style={{ animationDelay: '0.4s' }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: themeColor, animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Phase 2: Promotional Popup (Centered Toast) */}
            {phase === 'popup' && (
                <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                    <div
                        className={`
                            max-w-md w-full bg-white dark:bg-[#1a1c1e] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] 
                            border border-white/10 p-8 pointer-events-auto relative overflow-hidden transition-all duration-700
                            ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}
                        `}
                    >
                        {/* Background Decoration */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: themeColor }}></div>

                        <div className="flex items-start gap-6 relative z-10">
                            <div className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-white/5 text-3xl">
                                🎁
                            </div>

                            <div className="flex-1 space-y-2">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    Special Offer
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-bold leading-relaxed text-sm">
                                    {t.welcomePromo}
                                </p>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 transition-all active:scale-90"
                        >
                            <HiXMark size={20} />
                        </button>

                        {/* Progress Bar (Visual indicator of auto-close) */}
                        <div className="absolute bottom-0 left-0 h-1 bg-current transition-all duration-[5000ms] ease-linear" style={{ width: isVisible ? '0%' : '100%', color: themeColor }}></div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin-slow {
                    to { transform: rotate(360deg); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up-fade {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-spin-slow { animation: spin-slow 2s linear infinite; }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .animate-slide-up-fade { animation: slide-up-fade 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default WelcomeSequence;
