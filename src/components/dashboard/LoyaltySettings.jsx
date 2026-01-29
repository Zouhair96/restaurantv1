import React, { useState } from 'react';
import { HiFire, HiClock, HiCalendarDays, HiQrCode, HiSparkles, HiChevronDown, HiArrowPath, HiBookOpen } from 'react-icons/hi2';
import RecoveryOfferModal from './RecoveryOfferModal';
import LoyaltyDocumentation from './LoyaltyDocumentation';

const LoyaltySettings = ({ onUpdate }) => {
    const [isAutoPromoOn, setIsAutoPromoOn] = useState(true);
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recoveryConfig, setRecoveryConfig] = useState({
        type: 'discount',
        value: '20',
        active: true,
        delay: '21',
        frequency: '30'
    });
    const [showDocumentation, setShowDocumentation] = useState(false);

    // 1. Fetch Config on Mount
    React.useEffect(() => {
        const fetchConfig = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('[Loyalty] Fetching config...');
                const response = await fetch('/api/loyalty-analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('[Loyalty] Loaded data:', data);
                    if (data.loyalty_config) {
                        const config = data.loyalty_config;
                        if (config.isAutoPromoOn !== undefined) {
                            setIsAutoPromoOn(config.isAutoPromoOn);
                        }
                        if (config.recoveryConfig) {
                            setRecoveryConfig(prev => ({
                                ...prev,
                                ...config.recoveryConfig
                            }));
                        }
                    }
                } else {
                    console.error('[Loyalty] Fetch failed:', response.status, await response.text());
                }
            } catch (err) {
                console.error('[Loyalty] Failed to load loyalty config:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // 2. Persist Changes to Backend
    const saveConfig = async (updates) => {
        try {
            const token = localStorage.getItem('token');
            console.log('[Loyalty] Saving updates:', updates);
            const response = await fetch('/api/loyalty-analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ configUpdate: updates })
            });
            if (!response.ok) {
                console.error('[Loyalty] Save failed:', response.status, await response.text());
            } else {
                console.log('[Loyalty] Save successful');
            }
        } catch (err) {
            console.error('[Loyalty] Failed to save loyalty config:', err);
        }
    };

    const handleSaveRecovery = (newOffer) => {
        const updated = { ...recoveryConfig, ...newOffer };
        setRecoveryConfig(updated);
        setIsRecoveryModalOpen(false);
        saveConfig({ recoveryConfig: updated });
    };

    const handleToggleAutoPromo = (checked) => {
        setIsAutoPromoOn(checked);
        saveConfig({ isAutoPromoOn: checked });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-8 h-8 border-4 border-yum-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleTestPromo = () => {
        setShowDocumentation(true);
    };

    return (
        <div className="space-y-6 animate-fade-in mb-10">
            {/* Documentation View */}
            {showDocumentation ? (
                <LoyaltyDocumentation onBack={() => setShowDocumentation(false)} />
            ) : (
                <>
                    {/* Main Loyalty Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* 1. Global Auto-Promo Card */}
                        <div className="bg-white dark:bg-[#1a1c23] p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                                    <HiSparkles className="w-6 h-6" />
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAutoPromoOn}
                                        onChange={(e) => handleToggleAutoPromo(e.target.checked)}
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
                        <div className="bg-white dark:bg-[#1a1c23] p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm col-span-1 lg:col-span-2">
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
                                                onChange={(e) => {
                                                    const updated = { ...recoveryConfig, delay: e.target.value };
                                                    setRecoveryConfig(updated);
                                                    saveConfig({ recoveryConfig: updated });
                                                }}
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
                                                onChange={(e) => {
                                                    const updated = { ...recoveryConfig, frequency: e.target.value };
                                                    setRecoveryConfig(updated);
                                                    saveConfig({ recoveryConfig: updated });
                                                }}
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

                    {/* Documentation Access Button */}
                    <div className="bg-gradient-to-r from-[#2c3e50] to-[#000000] p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group border border-white/5 mt-6">
                        <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-yum-primary/20 text-yum-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                Guide & Support
                            </div>
                            <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                                <HiBookOpen size={32} className="text-yum-primary" /> System Documentation
                            </h3>
                            <p className="text-gray-400 text-sm mt-2 max-w-sm font-medium">
                                Learn how the automated Loyalty & Recovery host works across different customer types and languages.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowDocumentation(true)}
                            className="relative z-10 px-10 py-5 bg-white text-black font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-3"
                        >
                            Open Guide
                        </button>

                        <HiBookOpen size={160} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </div>
                </>
            )}

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
