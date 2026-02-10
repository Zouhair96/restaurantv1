import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiCheckCircle, HiChevronLeft, HiTrash, HiOutlineTicket, HiSparkles } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLoyalty } from '../../context/LoyaltyContext';
import { translations } from '../../translations';
import { calculateOrderDiscount, calculateLoyaltyDiscount } from '../../utils/promoUtils';
import { getLoyaltyMessage, LOYALTY_MESSAGE_KEYS } from '../../translations/loyaltyMessages';
import LoyaltyProgressBar from '../loyalty/LoyaltyProgressBar';

const CheckoutFun = ({
    isOpen,
    onClose,
    restaurantName,
    themeColor = '#f97316',
    promotions = [],
    taxConfig = { applyTax: false, taxPercentage: 0 },
    isDarkMode = false
}) => {
    const { cartItems, getCartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
    const { language, t: globalT } = useLanguage();
    const { getStatus, recordCompletedOrder, clientId, convertGift, revertGift } = useLoyalty();
    const loyaltyInfo = getStatus(restaurantName);
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

    const [useLoyaltyReward, setUseLoyaltyReward] = useState(true);
    const [modalState, setModalState] = useState({ show: false, type: null, giftId: null });

    const handleToggleReward = () => {
        const activeGift = loyaltyInfo.activeGifts?.[0];
        const convertedGift = loyaltyInfo.convertedGifts?.[0];

        if (activeGift) {
            setModalState({ show: true, type: 'CONVERT', giftId: activeGift.id });
        } else if (convertedGift) {
            setModalState({ show: true, type: 'REVERT', giftId: convertedGift.id });
        } else {
            setUseLoyaltyReward(!useLoyaltyReward);
        }
    };

    const confirmAction = async () => {
        const { type, giftId } = modalState;
        setModalState({ ...modalState, show: false });
        setLoading(true);
        setError('');

        try {
            let result;
            if (type === 'CONVERT') {
                result = await convertGift(restaurantName, giftId, subtotal);
            } else if (type === 'REVERT') {
                result = await revertGift(restaurantName, giftId);
            }

            if (result && !result.success && result.error) {
                setError(result.error);
                console.error('[Checkout] Conversion/Reversal failed:', result.error);
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
            console.error('[Checkout] Exception during conversion/reversal:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        if (!isOpen) {
            setIsSubmitted(false);
        }
    }, [isOpen]);

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
            const finalLoyaltyId = clientId || localStorage.getItem('loyalty_client_id_v2');

            const activeGift = loyaltyInfo.activeGifts?.[0];
            const loyaltyGiftId = activeGift ? activeGift.id : null;

            const orderData = {
                restaurantName,
                orderType,
                tableNumber,
                paymentMethod: 'cash',
                items: cartItems,
                totalPrice: total,
                discount: orderDiscount,
                subtotal: subtotal,
                loyalty_discount_applied: isApplied && (loyaltyDiscount > 0 || !!loyaltyGift),
                loyalty_discount_amount: isApplied ? loyaltyDiscount : 0,
                loyalty_gift_item: isApplied ? loyaltyGift : null,
                loyalty_id: finalLoyaltyId,
                loyalty_gift_id: loyaltyGiftId
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

            if (result.orderId) {
                localStorage.setItem('activeOrderId', result.orderId);
                window.dispatchEvent(new CustomEvent('orderPlaced', {
                    detail: { orderId: result.orderId }
                }));
            }

            setIsSubmitted(true);
            recordCompletedOrder(restaurantName, total);

            setTimeout(() => {
                clearCart();
                setIsSubmitted(false);
                onClose();
            }, 5000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const subtotal = getCartTotal();
    const { discount: orderDiscount, promo: orderPromo } = calculateOrderDiscount(promotions, subtotal);

    const { totalVisits } = loyaltyInfo;

    const {
        discount: loyaltyDiscount,
        reason: loyaltyReason,
        giftItem: loyaltyGift,
        messageKey,
        messageVariables,
        welcomeTeaser,
        showProgress,
        progressPercentage,
        isLoyal,
        needsMoreSpending,
        isApplied
    } = calculateLoyaltyDiscount(
        loyaltyInfo,
        subtotal,
        loyaltyInfo.config || { isAutoPromoOn: true },
        useLoyaltyReward
    );

    const totalOrderDiscount = orderDiscount + loyaltyDiscount;
    const discountedSubtotal = Math.max(0, subtotal - totalOrderDiscount);

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
                    className="fixed inset-0 z-[110] flex flex-col bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50"
                >
                    <style>{`
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>

                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1, rotate: -10 }}
                            onClick={onClose}
                            className="w-12 h-12 flex items-center justify-center rounded-full shadow-lg bg-white border-2 border-orange-100 text-orange-500"
                        >
                            {isSubmitted ? <HiXMark size={28} /> : <HiChevronLeft size={28} />}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            onClick={() => {
                                if (window.confirm('Clear your cart?')) clearCart();
                            }}
                            className="w-12 h-12 flex items-center justify-center rounded-full shadow-lg bg-white border-2 border-orange-100 text-gray-400 hover:text-red-500"
                        >
                            <HiTrash size={24} />
                        </motion.button>
                    </div>

                    {isSubmitted ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-40 h-40 rounded-full flex items-center justify-center mb-8 bg-white shadow-xl border-4 border-green-100"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    <HiCheckCircle size={80} className="text-green-500" />
                                </motion.div>
                            </motion.div>
                            <h2 className="text-4xl font-black mb-2 text-gray-800 tracking-tight">{t.success}</h2>
                            <p className="text-gray-500 font-medium text-lg">{t.thanks}</p>
                        </div>
                    ) : (
                        <>
                            {/* Body */}
                            <div className="flex-1 px-6 overflow-y-auto no-scrollbar pb-32">
                                <div className="text-center mt-4 mb-8">
                                    <h1 className="text-3xl font-black uppercase tracking-tight text-gray-800" dangerouslySetInnerHTML={{ __html: t.myCart }}></h1>
                                    <div className="h-2 w-16 mx-auto mt-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500" />
                                </div>

                                {cartItems.length === 0 ? (
                                    <motion.div
                                        animate={isShaking ? {
                                            x: [0, -10, 10, -10, 10, 0],
                                            transition: { duration: 0.4 }
                                        } : {}}
                                        className="flex flex-col items-center justify-center py-20 opacity-40 text-gray-400"
                                    >
                                        <HiOutlineTicket size={80} className="mb-4" />
                                        <p className="font-black mt-4 uppercase tracking-widest text-sm">{t.emptyCart}</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-4">
                                        {cartItems.map((item, index) => (
                                            <motion.div
                                                key={`${item.id}-${index}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center gap-4 bg-white p-3 rounded-3xl shadow-sm border-2 border-orange-50"
                                            >
                                                {/* Item Image */}
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-gray-50">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-lg leading-tight mb-1 text-gray-800 truncate">{item.name}</h3>
                                                    <p className="text-orange-500 font-bold text-sm">
                                                        <span className="text-xl">${Number(item.price).toFixed(2)}</span>
                                                    </p>
                                                </div>

                                                {/* Vertical +/- Controls */}
                                                <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-1 gap-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-600 font-black hover:text-green-500 hover:shadow-md transition-all"
                                                    >
                                                        +
                                                    </button>
                                                    <span className="text-xs font-black text-gray-800 px-1">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, Math.max(0, item.quantity - 1))}
                                                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-600 font-black hover:text-red-500 hover:shadow-md transition-all"
                                                    >
                                                        -
                                                    </button>
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
                                className="bg-white rounded-t-[3rem] px-8 pt-8 pb-10 shadow-[0_-10px_40px_rgba(249,115,22,0.15)] space-y-4 border-t-4 border-white"
                            >
                                <div className="flex justify-between items-center text-gray-500 border-b border-dashed border-gray-100 pb-4">
                                    <span className="font-bold">{t.subtotal}</span>
                                    <span className="font-black text-xl text-gray-800">${subtotal.toFixed(2)}</span>
                                </div>

                                {orderDiscount > 0 && (
                                    <div className="flex justify-between items-center text-green-600 bg-green-50 p-3 rounded-2xl border border-green-100">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Promo Discount</span>
                                            <span className="text-[10px] italic font-medium opacity-80">{orderPromo.name}</span>
                                        </div>
                                        <span className="font-black text-lg">-${orderDiscount.toFixed(2)}</span>
                                    </div>
                                )}

                                {loyaltyGift && (
                                    <div className={`flex justify-between items-center p-3 rounded-2xl border ${loyaltyInfo.activeGifts?.[0] ? 'bg-pink-50 border-pink-100 text-pink-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm">Loyalty Gift</span>
                                                <button
                                                    onClick={handleToggleReward}
                                                    disabled={loading}
                                                    className={`w-10 h-6 rounded-full relative transition-colors shadow-inner ${loyaltyInfo.activeGifts?.[0] ? 'bg-pink-500' : 'bg-gray-300'}`}
                                                >
                                                    <motion.div
                                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                                        animate={{ left: loyaltyInfo.activeGifts?.[0] ? 20 : 4 }}
                                                    />
                                                </button>
                                            </div>
                                            <span className="text-[10px] italic font-medium opacity-80">{loyaltyGift}</span>
                                        </div>
                                        <span className="font-black text-lg">$0.00</span>
                                    </div>
                                )}

                                {(loyaltyDiscount > 0 || (isLoyal && !loyaltyGift)) && (
                                    <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-2xl border border-yellow-100 text-yellow-700">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Loyalty Reward</span>
                                            <span className="text-[10px] italic font-medium opacity-80">{loyaltyGift || ''}</span>
                                        </div>
                                        <span className="font-black text-lg">-${(loyaltyDiscount || 0).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pb-2 pt-2">
                                    <span className="text-2xl font-black text-gray-800">{t.total}</span>
                                    <span className="text-3xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">${total.toFixed(2)}</span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl text-white font-black flex flex-col items-center justify-center relative overflow-hidden transition-all shadow-xl bg-gradient-to-r from-orange-400 to-pink-500"
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
                    <ConversionConfirmationModal
                        state={modalState}
                        onConfirm={confirmAction}
                        onCancel={() => setModalState({ show: false, type: null, giftId: null })}
                        isDarkMode={isDarkMode}
                        themeColor={themeColor}
                        language={language}
                        loyaltyInfo={loyaltyInfo}
                        subtotal={subtotal}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ConversionConfirmationModal = ({ state, onConfirm, onCancel, isDarkMode, themeColor, language, loyaltyInfo, subtotal }) => {
    const { isOpen = state.show, type = state.type } = state;
    return (
        <AnimatePresence>
            {state.show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden shadow-2xl bg-white text-gray-900"
                    >
                        <div className="text-center">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${type === 'CONVERT' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                                <HiSparkles size={40} />
                            </div>
                            <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-gray-800">
                                {type === 'CONVERT' ? 'Convert to Points?' : 'Restore Reward?'}
                            </h3>

                            <div className="space-y-3 mt-8">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onConfirm}
                                    className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-wider shadow-lg ${type === 'CONVERT' ? 'bg-blue-500 shadow-blue-500/25' : 'bg-pink-500 shadow-pink-500/25'}`}
                                >
                                    {type === 'CONVERT' ? 'Yes, Convert' : 'Yes, Restore'}
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onCancel}
                                    className="w-full py-4 rounded-2xl font-black uppercase tracking-wider transition-colors bg-gray-100 hover:bg-gray-200 text-gray-600"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutFun;
