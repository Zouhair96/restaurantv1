import React, { useState } from 'react';
import { HiXMark, HiGift, HiTicket, HiCake, HiChevronDown } from 'react-icons/hi2';

const RecoveryOfferModal = ({ isOpen, onClose, onSave, currentConfig }) => {
    const [config, setConfig] = useState(currentConfig || {
        type: 'discount', // discount, dish, drink
        value: '',
        active: true
    });

    const offerTypes = [
        { id: 'discount', label: '% Discount', icon: HiTicket, color: 'bg-orange-500' },
        { id: 'dish', label: 'Bonus Dish', icon: HiGift, color: 'bg-green-500' },
        { id: 'drink', label: 'Free Drink/Dessert', icon: HiCake, color: 'bg-indigo-500' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1a1c23] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-white/10">
                {/* Header */}
                <div className="p-6 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Recovery Offer</h3>
                        <p className="text-gray-500 text-xs mt-1">Define what lost customers receive.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                        <HiXMark className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Offer Type Selection */}
                    <div className="grid grid-cols-3 gap-3">
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
                            {config.type === 'discount' ? 'Discount Percentage (%)' : 'Offer Description'}
                        </label>
                        <div className="relative">
                            <input
                                type={config.type === 'discount' ? 'number' : 'text'}
                                value={config.value}
                                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                                placeholder={config.type === 'discount' ? 'e.g. 20' : 'e.g. Free Tiramisu'}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-yum-primary/20"
                            />
                            {config.type === 'discount' && (
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</span>
                            )}
                        </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Offer Status</span>
                            <span className="text-[10px] text-gray-400">Enable or disable this specific offer</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.active}
                                onChange={(e) => setConfig({ ...config, active: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-50 dark:border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-6 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white font-bold rounded-xl text-xs uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(config)}
                        className="flex-1 py-3 px-6 bg-yum-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-yum-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Save Offer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecoveryOfferModal;
