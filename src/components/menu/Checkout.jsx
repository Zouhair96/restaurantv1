import React, { useState } from 'react';
import { HiXMark, HiCheckCircle, HiArrowRight } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';
import { translations } from '../../translations';

const Checkout = ({ isOpen, onClose, restaurantName, themeColor = '#f97316', language = 'fr' }) => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Translation setup
    const lang = language.toLowerCase();
    const t = translations[lang]?.auth?.checkout || translations['fr']?.auth?.checkout;

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        tableSelection: 'take_out', // 'take_out' or '1', '2', etc.
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
                paymentMethod: formData.paymentMethod === 'card' ? 'credit_card' : 'cash',
                items: cartItems,
                totalPrice: getCartTotal(),
                // Add customer details if needed by backend, though submit-order.js currently doesn't strictly require name/phone in the body for the order record itself, it's good for the restaurant
                customerName: formData.name,
                customerPhone: formData.phone
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

            if (!response.ok) {
                throw new Error(result.error || t.error);
            }

            if (result.checkoutUrl) {
                // Redirect to Stripe
                window.location.href = result.checkoutUrl;
                return;
            }

            setIsSubmitted(true);
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

    if (!isOpen) return null;

    // Generate table options 1-20
    const tableOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

    return (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#0f1115] rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-white/10 animate-scale-in">
                {isSubmitted ? (
                    // Success Screen
                    <div className="p-12 text-center">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                            <HiCheckCircle size={64} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                            {t.success}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {t.thanks}
                        </p>
                        <p className="text-sm font-medium text-gray-400">
                            {t.preparing}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {t.title}
                                </h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{restaurantName}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                            >
                                <HiXMark size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold animate-shake">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Form Fields */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                                {t.fullName}
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-theme transition-all font-bold"
                                                style={{ '--theme-color': themeColor }}
                                                placeholder="Jean Dupont"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                                {t.phone}
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-theme transition-all font-bold"
                                                style={{ '--theme-color': themeColor }}
                                                placeholder="06 ..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                            {t.orderType}
                                        </label>
                                        <select
                                            name="tableSelection"
                                            value={formData.tableSelection}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-theme transition-all font-bold appearance-none cursor-pointer"
                                            style={{ '--theme-color': themeColor }}
                                        >
                                            <option value="take_out">{t.takeOut}</option>
                                            {tableOptions.map(num => (
                                                <option key={num} value={num}>{t.table} {num}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">
                                            {t.paymentMethod}
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                                                className={`py-4 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 ${formData.paymentMethod === 'cash'
                                                    ? 'border-theme bg-theme text-white shadow-lg'
                                                    : 'border-gray-100 dark:border-white/5 text-gray-400 hover:border-gray-200 dark:hover:border-white/10'
                                                    }`}
                                                style={formData.paymentMethod === 'cash' ? { backgroundColor: themeColor, borderColor: themeColor } : { '--theme-color': themeColor }}
                                            >
                                                <span className="text-xl">💵</span> {t.cash}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                                                className={`py-4 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 ${formData.paymentMethod === 'card'
                                                    ? 'border-theme bg-theme text-white shadow-lg'
                                                    : 'border-gray-100 dark:border-white/5 text-gray-400 hover:border-gray-200 dark:hover:border-white/10'
                                                    }`}
                                                style={formData.paymentMethod === 'card' ? { backgroundColor: themeColor, borderColor: themeColor } : { '--theme-color': themeColor }}
                                            >
                                                <span className="text-xl">💳</span> {t.card}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.summary}</span>
                                        <span className="text-xs font-black text-gray-400">{cartItems.length} Items</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-white/5 p-4 rounded-2xl">
                                        <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t.total}</span>
                                        <span className="text-2xl font-black" style={{ color: themeColor }}>
                                            {getCartTotal().toFixed(2)}€
                                        </span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || cartItems.length === 0}
                                    className="w-full py-5 rounded-3xl text-white font-black uppercase tracking-widest text-sm shadow-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    style={{ backgroundColor: themeColor, boxShadow: `0 20px 40px -10px ${themeColor}40` }}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            {t.confirm}
                                            <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
        </div>
    );
};

export default Checkout;
