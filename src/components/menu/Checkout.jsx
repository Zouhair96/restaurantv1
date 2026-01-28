import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiCheckCircle, HiChevronLeft, HiTrash, HiOutlineTicket } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations';
import { calculateOrderDiscount } from '../../utils/promoUtils';

const Checkout = ({
    isOpen,
    onClose,
    restaurantName,
    themeColor = '#f97316',
    promotions = [],
    taxConfig = { applyTax: false, taxPercentage: 0 }
}) => {
    const { cartItems, getCartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
    const { language, t: globalT } = useLanguage();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const lang = language.toLowerCase();
    const t = translations[lang]?.auth?.checkout || translations['fr']?.auth?.checkout;
    const menuT = translations[lang]?.menu || translations['fr']?.menu;

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

        if (cartItems.length === 0) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            return;
        }

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
                totalPrice: total,
                discount: orderDiscount,
                subtotal: subtotal
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

    const subtotal = getCartTotal();
    const { discount: orderDiscount, promo: orderPromo } = calculateOrderDiscount(promotions, subtotal);
    const discountedSubtotal = Math.max(0, subtotal - orderDiscount);

    // Dynamic Tax Calculation
    const taxRate = taxConfig.applyTax ? (taxConfig.taxPercentage / 100) : 0;
    const tax = discountedSubtotal * taxRate;
    const total = discountedSubtotal + tax;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed inset-0 z-[110] bg-[#f8f9fa] flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-gray-900"
                        >
                            <HiChevronLeft size={24} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                if (window.confirm('Clear your cart?')) clearCart();
                            }}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <HiTrash size={24} />
                        </motion.button>
                    </div>

                    {isSubmitted ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-8 bg-white shadow-xl"
                            >
                                <HiCheckCircle size={80} style={{ color: themeColor }} />
                            </motion.div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">{t.success}</h2>
                            <p className="text-gray-500 font-medium">{t.thanks}</p>
                        </div>
                    ) : (
                        <>
                            {/* Body */}
                            <div className="flex-1 px-6 overflow-y-auto no-scrollbar pb-32">
                                <h1 className="text-4xl font-black text-gray-900 mb-8 mt-4 tracking-tight" dangerouslySetInnerHTML={{ __html: t.myCart }} />

                                {cartItems.length === 0 ? (
                                    <motion.div
                                        animate={isShaking ? {
                                            x: [0, -10, 10, -10, 10, 0],
                                            transition: { duration: 0.4 }
                                        } : {}}
                                        className="flex flex-col items-center justify-center py-20 opacity-40"
                                    >
                                        <HiTrash size={64} />
                                        <p className="font-bold mt-4 uppercase tracking-widest text-xs">{t.emptyCart}</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-6">
                                        {cartItems.map((item, index) => (
                                            <motion.div
                                                key={`${item.id}-${index}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center gap-4 group"
                                            >
                                                {/* Item Image */}
                                                <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-md flex-shrink-0 bg-white border border-gray-100">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{item.name}</h3>
                                                    <p className="text-gray-400 font-bold text-sm">
                                                        <span className="text-gray-900">${Number(item.price).toFixed(2)}</span>
                                                        <span className="ml-2">x {item.quantity}</span>
                                                    </p>
                                                </div>

                                                {/* Vertical +/- Controls */}
                                                <div className="flex flex-col items-center bg-gray-900 text-white rounded-2xl py-1 px-1 shadow-md">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform"
                                                    >
                                                        <span className="text-xl font-bold">+</span>
                                                    </button>
                                                    {item.quantity > 1 && (
                                                        <>
                                                            <div className="h-px w-4 bg-white/20 my-1" />
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                                className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform"
                                                            >
                                                                <span className="text-xl font-bold">-</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                            </div>

                            {/* Bottom Card */}
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                className="bg-white rounded-t-[3rem] px-8 pt-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] space-y-4 border-t border-gray-50"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-bold">{t.subtotal}</span>
                                    <span className="text-gray-900 font-black text-lg">${subtotal.toFixed(2)}</span>
                                </div>
                                {orderDiscount > 0 && (
                                    <div className="flex justify-between items-center text-green-600 dark:text-green-500">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Promo Discount</span>
                                            <span className="text-[10px] italic font-medium">{orderPromo.name}</span>
                                        </div>
                                        <span className="font-black text-lg">-${orderDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                {taxConfig.applyTax && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold">
                                            {t.taxes} ({taxConfig.taxPercentage}%)
                                        </span>
                                        <span className="text-gray-900 font-black text-lg">${tax.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="h-px bg-dashed bg-gray-100 my-2 border-t-2 border-dashed border-gray-100" />
                                <div className="flex justify-between items-center pb-2">
                                    <span className="text-gray-900 text-xl font-black">{t.total}</span>
                                    <span className="text-gray-900 text-2xl font-black">${total.toFixed(2)}</span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl text-white font-black flex flex-col items-center justify-center relative overflow-hidden transition-all active:scale-[0.98]"
                                    style={{
                                        backgroundColor: themeColor,
                                        boxShadow: `0 12px 32px -8px ${themeColor}88`
                                    }}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <div className="flex flex-col items-center leading-tight">
                                            <span className="text-xl uppercase tracking-tighter">{t.confirm}</span>
                                            <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest">{t.confirmSub}</span>
                                        </div>
                                    )}
                                </motion.button>
                            </motion.div>
                        </>
                    )}
                </motion.div>
            )}

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </AnimatePresence>
    );
};

// Internal icon for the button (since I didn't import HiArrowRight in the rewrite)
const HiArrowRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

export default Checkout;
