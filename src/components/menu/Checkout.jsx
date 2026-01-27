import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiCheckCircle, HiArrowRight, HiBuildingStorefront, HiBanknotes } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';
import { translations } from '../../translations';

const Checkout = ({ isOpen, onClose, restaurantName, themeColor = '#f97316', language = 'fr' }) => {
    const { cartItems, getCartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const lang = language.toLowerCase();
    const t = translations[lang]?.auth?.checkout || translations['fr']?.auth?.checkout;

    const [formData, setFormData] = useState({
        tableSelection: 'take_out',
        paymentMethod: 'cash',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const orderType = formData.tableSelection === 'take_out' ? 'take_out' : 'dine_in';
            const tableNumber = orderType === 'dine_in' ? formData.tableSelection : null;

            const orderData = {
                restaurantName,
                orderType,
                tableNumber,
                paymentMethod: 'cash',
                items: cartItems,
                totalPrice: getCartTotal()
            };

            const token = localStorage.getItem('client_token');
            const response = await fetch('/.netlify/functions/submit-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || t.error);

            setIsSubmitted(true);

            // Trigger tracking
            window.dispatchEvent(new CustomEvent('orderPlaced', {
                detail: { orderId: result.orderId }
            }));

            setTimeout(() => {
                clearCart();
                setIsSubmitted(false);
                onClose();
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tableOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white dark:bg-[#0a0a0b] rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-hidden border border-white/5"
                    >
                        {isSubmitted ? (
                            <div className="p-16 text-center">
                                <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto mb-10 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-theme/20 animate-pulse" style={{ backgroundColor: `${themeColor}20` }}></div>
                                    <HiCheckCircle size={72} className="relative z-10" style={{ color: themeColor }} />
                                </div>
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">{t.success}</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed">{t.thanks}</p>
                            </div>
                        ) : (
                            <>
                                <div className="px-10 pt-10 pb-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Checkout</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }}></div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{restaurantName}</span>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="w-14 h-14 flex items-center justify-center rounded-3xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 transition-all">
                                        <HiXMark size={28} />
                                    </button>
                                </div>

                                <div className="px-10 pb-10 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(90vh - 160px)' }}>
                                    {error && (
                                        <div className="mb-8 p-5 bg-red-500/5 border-l-4 border-red-500 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
                                            <div className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-10">
                                        <div className="space-y-6 text-center">
                                            <div className="relative group">
                                                <label className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-1">
                                                    <HiBuildingStorefront className="w-4 h-4" />
                                                    {t.orderType}
                                                </label>
                                                <div className="relative max-w-xs mx-auto">
                                                    <select
                                                        name="tableSelection"
                                                        value={formData.tableSelection}
                                                        onChange={handleChange}
                                                        className="w-full pl-6 pr-12 py-5 rounded-[2rem] border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-theme appearance-none cursor-pointer font-black text-lg transition-all"
                                                        style={{ '--theme-color': themeColor }}
                                                    >
                                                        <option value="take_out" className="dark:bg-black">🛍️ {t.takeOut}</option>
                                                        <optgroup label="Tables" className="dark:bg-black font-bold">
                                                            {tableOptions.map(num => (
                                                                <option key={num} value={num}>🍱 {t.table} {num}</option>
                                                            ))}
                                                        </optgroup>
                                                    </select>
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Item List */}
                                        <div className="space-y-4 mb-8">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{t.items || 'Your Selection'}</h3>
                                            <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pr-2">
                                                {cartItems.map((item, index) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        key={`${item.id}-${index}`}
                                                        className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-theme/30 transition-all"
                                                    >
                                                        <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-white dark:border-white/10 shadow-sm relative">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-sm font-black text-theme" style={{ color: themeColor }}>
                                                                    ${(item.price * item.quantity).toFixed(2)}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-400">({item.quantity}x)</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center bg-white dark:bg-[#1a1c1e] rounded-2xl border border-gray-100 dark:border-white/5 p-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                                                            >
                                                                <HiXMark className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-6 text-center text-xs font-black text-gray-900 dark:text-white">{item.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                                className="w-8 h-8 flex items-center justify-center text-theme hover:scale-110 transition-all"
                                                                style={{ color: themeColor }}
                                                            >
                                                                <HiArrowRight className="w-4 h-4 -rotate-90" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Summary Bar */}
                                            <div className="p-6 rounded-[2rem] bg-gray-900 dark:bg-white/10 text-white flex justify-between items-center shadow-lg">
                                                <div>
                                                    <span className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">{t.total}</span>
                                                    <span className="text-3xl font-black tracking-tighter">${getCartTotal().toFixed(2)}</span>
                                                </div>
                                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                                    {/* Icon removed for simplicity */}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || cartItems.length === 0}
                                            className="w-full py-7 rounded-[2rem] text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 group relative overflow-hidden"
                                            style={{ backgroundColor: themeColor, boxShadow: `0 24px 48px -12px ${themeColor}40` }}
                                        >
                                            {loading ? (
                                                <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="relative z-10">Confirme (au comptoir)</span>
                                                        <span className="text-[10px] opacity-70 tracking-[0.3em] font-black">{t.cash}</span>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative z-10 group-hover:translate-x-2 transition-transform duration-500">
                                                        <HiBanknotes className="w-6 h-6" />
                                                    </div>
                                                </>
                                            )}
                                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </AnimatePresence>
    );
};

export default Checkout;
