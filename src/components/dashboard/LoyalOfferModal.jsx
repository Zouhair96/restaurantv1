import React, { useState, useEffect } from 'react';
import { HiXMark, HiGift, HiTicket, HiBanknotes, HiChevronDown } from 'react-icons/hi2';

const LoyalOfferModal = ({ isOpen, currentConfig, menuItems = [], onClose, onSave }) => {
    const [config, setConfig] = useState(currentConfig);
    const [searchTerm, setSearchTerm] = useState(currentConfig.value || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        setConfig(currentConfig);
        setSearchTerm(currentConfig.value || '');
    }, [currentConfig]);

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = () => {
        onSave(config);
    };

    if (!isOpen) return null;

    const offerTypes = [
        { id: 'discount', label: '% Discount', icon: HiTicket },
        { id: 'item', label: 'Specific Item', icon: HiGift }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1a1c23] w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Configure Loyal Reward</h3>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Applied for 4th visit+</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 transition-colors">
                            <HiXMark className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Offer Type Toggle */}
                        <div className="flex p-1 bg-gray-50 dark:bg-white/5 rounded-2xl gap-1">
                            {offerTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setConfig({ ...config, type: type.id })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${config.type === type.id
                                        ? 'bg-white dark:bg-[#252833] text-yum-primary shadow-sm ring-1 ring-gray-100 dark:ring-white/10'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <type.icon className="w-4 h-4" />
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* Value Input */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                {config.type === 'discount' ? 'Discount Percentage' : 'Select Item from Menu'}
                            </label>
                            <div className="relative">
                                {config.type === 'discount' ? (
                                    <>
                                        <input
                                            type="number"
                                            value={config.value}
                                            onChange={(e) => setConfig({ ...config, value: e.target.value })}
                                            placeholder="15"
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-yum-primary/20"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setIsDropdownOpen(true);
                                                setConfig({ ...config, value: e.target.value });
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            placeholder="Search Burger, Drinks..."
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-yum-primary/20"
                                        />
                                        <HiChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />

                                        {isDropdownOpen && filteredItems.length > 0 && (
                                            <div className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white dark:bg-[#252833] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                                {filteredItems.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                                                        onClick={() => {
                                                            setSearchTerm(item.name);
                                                            setConfig({ ...config, value: item.name });
                                                            setIsDropdownOpen(false);
                                                        }}
                                                    >
                                                        <span className="font-bold text-gray-900 dark:text-white">{item.name}</span>
                                                        <span className="text-xs font-black text-yum-primary">€{item.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {/* Click outside backdrop for dropdown */}
                                        {isDropdownOpen && (
                                            <div
                                                className="fixed inset-0 z-40 bg-transparent"
                                                onClick={() => setIsDropdownOpen(false)}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Threshold Input */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                <HiBanknotes className="w-3 h-3" /> Minimum Spend Threshold
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={config.threshold}
                                    onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
                                    placeholder="30"
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-yum-primary/20"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                            </div>
                            <p className="text-[10px] text-gray-400 italic px-1">Offer only activates if the order total is above this amount.</p>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-4 bg-yum-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-yum-primary/20 hover:bg-yum-primary/90 transition-all"
                        >
                            Save configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyalOfferModal;
