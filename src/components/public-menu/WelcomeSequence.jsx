import React, { useState, useEffect } from 'react';
import { HiXMark, HiStar, HiSparkles } from 'react-icons/hi2';

const WelcomeSequence = ({
    restaurantName,
    themeColor = '#f97316',
    promoConfig = {}
}) => {
    // Extract config with defaults
    const {
        showWelcomePromo = true,
        welcomePromoText = "Bienvenue sur notre plateforme ! Profitez d’une réduction de 10% sur votre première commande, et pour nos clients fidèles, recevez un repas gratuit après chaque dix commandes !",
        loadingDuration = 5,
        promoDuration = 15
    } = promoConfig;

    const [phase, setPhase] = useState('loading'); // 'loading', 'popup', 'hidden'
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!showWelcomePromo) {
            setPhase('hidden');
            return;
        }

        // Initial Loading Phase
        const loadingTimer = setTimeout(() => {
            setPhase('popup');
            setIsVisible(true);
        }, loadingDuration * 1000);

        return () => clearTimeout(loadingTimer);
    }, [showWelcomePromo, loadingDuration]);

    useEffect(() => {
        if (phase === 'popup') {
            // Auto-hide popup
            const popupTimer = setTimeout(() => {
                handleClose();
            }, promoDuration * 1000);
            return () => clearTimeout(popupTimer);
        }
    }, [phase, promoDuration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => setPhase('hidden'), 500); // Wait for transition
    };

    if (phase === 'hidden' || !showWelcomePromo) return null;

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none">
            {/* Phase 1: Cinematic Loading Page */}
            {phase === 'loading' && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-auto z-[210] overflow-hidden">
                    <div className="absolute inset-0 opacity-40">
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-950 via-black to-black"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] animate-slow-zoom pointer-events-none opacity-20">
                            <div className="w-full h-full border-[40px] border-orange-500/10 rounded-full blur-3xl"></div>
                            <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center max-w-2xl px-8 text-center">
                        <div className="mb-12 relative">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
                                <HiStar className="w-16 h-16 text-orange-500 animate-spin-slow" />
                                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"></div>
                            </div>
                            <HiSparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-500 animate-pulse" />
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none animate-reveal-text">
                                {restaurantName}
                            </h2>
                            <div className="h-1 w-24 bg-orange-500 mx-auto rounded-full animate-stretch"></div>
                            <p className="text-orange-200/60 font-medium tracking-[0.2em] text-xs uppercase animate-fade-in-delayed">
                                L'aventure Culinaire Commence...
                            </p>
                        </div>

                        <div className="mt-16 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-500 transition-all ease-linear"
                                style={{
                                    width: '100%',
                                    transitionDuration: `${loadingDuration}s`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Phase 2: Promotional Popup */}
            {phase === 'popup' && (
                <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                    <div
                        className={`
                            max-w-md w-full bg-white dark:bg-[#0f1115] rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] 
                            border border-white/5 p-10 pointer-events-auto relative overflow-hidden transition-all duration-1000
                            ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90'}
                        `}
                    >
                        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: themeColor }}></div>
                        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: themeColor }}></div>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center bg-gray-50 dark:bg-white/5 text-4xl shadow-inner">
                                    🎁
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                        Offre Spéciale
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actif Maintenant</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 font-bold leading-relaxed text-lg tracking-tight">
                                {welcomePromoText}
                            </p>

                            <button
                                onClick={handleClose}
                                className="w-full py-5 rounded-[1.5rem] bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                            >
                                Commencer l'Exploration
                            </button>
                        </div>

                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 transition-all active:scale-90"
                        >
                            <HiXMark size={24} />
                        </button>

                        <div
                            className="absolute bottom-0 left-0 h-1.5 transition-all ease-linear"
                            style={{
                                width: isVisible ? '0%' : '100%',
                                backgroundColor: themeColor,
                                opacity: 0.5,
                                transitionDuration: `${promoDuration}s`
                            }}
                        ></div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin-slow { to { transform: rotate(360deg); } }
                @keyframes slow-zoom { 0% { transform: translate(-50%, -50%) scale(1); } 100% { transform: translate(-50%, -50%) scale(1.2); } }
                @keyframes reveal-text { from { transform: translateY(40px); opacity: 0; filter: blur(10px); } to { transform: translateY(0); opacity: 1; filter: blur(0); } }
                @keyframes stretch { from { width: 0; opacity: 0; } to { width: 6rem; opacity: 1; } }
                @keyframes shimmer { to { transform: translateX(200%); } }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
                .animate-slow-zoom { animation: slow-zoom 10s ease-out forwards; }
                .animate-reveal-text { animation: reveal-text 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
                .animate-stretch { animation: stretch 1.5s cubic-bezier(0.19, 1, 0.22, 1) 0.5s forwards; }
                .animate-fade-in-delayed { animation: fade-in 1s ease-out 1.5s forwards; opacity: 0; }
                .animate-shimmer { animation: shimmer 2.5s infinite; }
            `}</style>
        </div>
    );
};

export default WelcomeSequence;
