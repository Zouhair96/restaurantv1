import React, { useState, useEffect } from 'react';
import { HiXMark, HiGift, HiTicket, HiBanknotes } from 'react-icons/hi2';

const LoyalOfferModal = ({ isOpen, onClose, onSave, currentConfig }) => {
    const [config, setConfig] = useState(currentConfig || {
        type: 'discount',
        value: '15',
        threshold: '50',
        active: true
    });

    useEffect(() => {
        if (currentConfig) {
            setConfig(currentConfig);
        }
    }, [currentConfig]);

    if (!isOpen) return null;

    const offerTypes = [
        { id: 'discount', label: '% Discount', icon: HiTicket },
        { id: 'item', label: 'Specific Item', icon: HiGift }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1a1c23] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-white/10">
                <div className="p-6 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Loyal Reward</h3>
                        <p className="text-gray-500 text-xs mt-1">Reward for your best customers.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                        <HiXMark className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Threshold Input */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            <HiBanknotes className="w-4 h-4" /> Spending Threshold (€)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={config.threshold}
                                onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
                                placeholder="50"
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-yum-primary/20"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">€</span>
                        </div>
                    </div>

                    {/* Offer Type */}
                    <div className="grid grid-cols-2 gap-3">
                        {offerTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setConfig({ ...config, type: type.id })}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${config.type === type.id
                                    ? 'border-yum-primary bg-yum-primary/5'
                                    : 'border-gray-50 dark:border-white/5 hover:border-gray-200'
                                    }`}
                            >
                                <type.icon className={`w-6 h-6 mb-2 ${config.type === type.id ? 'text-yum-primary' : 'text-gray-400'}`} />
                                <span className={`text-[10px] font-bold text-center ${config.type === type.id ? 'text-yum-primary' : 'text-gray-500'}`}>
                                    {type.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Value Input */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            {config.type === 'discount' ? 'Discount Percentage (%)' : 'Gift Item Name'}
                        </label>
                        <div className="relative">
                            <input
                                type={config.type === 'discount' ? 'number' : 'text'}
                                value={config.value}
                                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                                placeholder={config.type === 'discount' ? '15' : 'Free Dessert'}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-yum-primary/20"
                            />
                            {config.type === 'discount' && (
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-50 dark:border-white/5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 px-6 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white font-bold rounded-xl text-xs uppercase tracking-widest">Cancel</button>
                    <button onClick={() => onSave(config)} className="flex-1 py-3 px-6 bg-yum-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-yum-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Config</button>
                </div>
            </div>
        </div>
    );
};

export default LoyalOfferModal;
