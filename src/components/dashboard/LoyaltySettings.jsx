import React, { useState } from 'react';
import { HiFire, HiClock, HiCalendarDays, HiQrCode, HiSparkles, HiChevronDown, HiArrowPath } from 'react-icons/hi2';
import RecoveryOfferModal from './RecoveryOfferModal';

const LoyaltySettings = ({ onUpdate }) => {
    const [isAutoPromoOn, setIsAutoPromoOn] = useState(true);
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
    const [recoveryConfig, setRecoveryConfig] = useState({
        type: 'discount',
        value: '20',
        active: true,
        delay: '21',
        frequency: '30'
    });

    const handleSaveRecovery = (newOffer) => {
        const updated = { ...recoveryConfig, ...newOffer };
        setRecoveryConfig(updated);
        setIsRecoveryModalOpen(false);
        onUpdate?.(updated);
    };

    const handleTestPromo = () => {
        // Simulation logic
        alert('🚀 Simulating QR Scan...\nClient would receive: ' +
            (recoveryConfig.type === 'discount' ? `${recoveryConfig.value}% Discount` : recoveryConfig.value));
    };

    return (
        <div className="space-y-6 animate-fade-in mb-10">
            {/* Main Loyalty Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Global Auto-Promo Card */}
                <div className="bg-white dark:bg-[#1a1c23] p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                            <HiSparkles className="w-6 h-6" />
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAutoPromoOn}
                                onChange={(e) => setIsAutoPromoOn(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Global Auto-Promo</h3>
                    <p className="text-gray-500 text-xs mb-4">Automatically activate all loyalty offers and recovery campaigns.</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAutoPromoOn ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {isAutoPromoOn ? 'System Online' : 'System Paused'}
                    </div>
                </div>

                {/* 2. Recovery Control Card */}
                <div className="bg-white dark:bg-[#1a1c23] p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm col-span-1 lg:col-span-2">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <HiArrowPath className="text-yum-primary" /> Recovery System
                            </h3>
                            <p className="text-gray-500 text-xs mb-6">Win back customers who haven't visited in a while.</p>

                            <button
                                onClick={() => setIsRecoveryModalOpen(true)}
                                className="w-full md:w-auto px-6 py-4 bg-yum-primary text-white font-bold rounded-2xl shadow-lg shadow-yum-primary/20 hover:bg-red-500 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                            >
                                <HiFire className="w-5 h-5" />
                                Configure Recovery Offer
                            </button>
                        </div>

                        <div className="md:w-px bg-gray-100 dark:bg-white/5 mx-2 hidden md:block"></div>

                        <div className="flex-1 space-y-4">
                            {/* Recovery Delay */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    <HiClock className="w-4 h-4" /> Recovery Delay
                                </label>
                                <div className="relative group">
                                    <select
                                        value={recoveryConfig.delay}
                                        onChange={(e) => setRecoveryConfig({ ...recoveryConfig, delay: e.target.value })}
                                        className="w-full appearance-none px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-yum-primary/20 cursor-pointer"
                                    >
                                        <option value="14">14 Days (Aggressive)</option>
                                        <option value="21">21 Days (Standard)</option>
                                        <option value="30">30 Days (Conservative)</option>
                                    </select>
                                    <HiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-yum-primary transition-colors pointer-events-none" />
                                </div>
                            </div>

                            {/* Max Advantage */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    <HiCalendarDays className="w-4 h-4" /> Max Advantage
                                </label>
                                <div className="relative group">
                                    <select
                                        value={recoveryConfig.frequency}
                                        onChange={(e) => setRecoveryConfig({ ...recoveryConfig, frequency: e.target.value })}
                                        className="w-full appearance-none px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-yum-primary/20 cursor-pointer"
                                    >
                                        <option value="30">1 time / 30 Days</option>
                                        <option value="60">1 time / 60 Days</option>
                                    </select>
                                    <HiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-yum-primary transition-colors pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Simulation Area */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <HiQrCode size={32} /> Simulation Tool
                    </h3>
                    <p className="text-indigo-100 text-sm mt-2 max-w-sm">
                        Test your promotion logic safely. Scan simulation does not affect real metrics.
                    </p>
                </div>

                <button
                    onClick={handleTestPromo}
                    className="relative z-10 px-10 py-5 bg-white text-indigo-600 font-extrabold rounded-2xl shadow-2xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-3"
                >
                    Test Promo Scan
                </button>

                {/* Decorative background qr codes */}
                <HiQrCode size={120} className="absolute -bottom-10 -right-10 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>

            {/* Config Modal */}
            <RecoveryOfferModal
                isOpen={isRecoveryModalOpen}
                currentConfig={recoveryConfig}
                onClose={() => setIsRecoveryModalOpen(false)}
                onSave={handleSaveRecovery}
            />
        </div>
    );
};

export default LoyaltySettings;
