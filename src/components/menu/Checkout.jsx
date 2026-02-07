import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiCheckCircle, HiChevronLeft, HiTrash, HiOutlineTicket } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLoyalty } from '../../context/LoyaltyContext';
import { translations } from '../../translations';
import { calculateOrderDiscount, calculateLoyaltyDiscount } from '../../utils/promoUtils';
import { getLoyaltyMessage, LOYALTY_MESSAGE_KEYS } from '../../translations/loyaltyMessages';
import LoyaltyProgressBar from '../loyalty/LoyaltyProgressBar';

const Checkout = ({
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
    const { getStatus, recordCompletedOrder, clientId } = useLoyalty();
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
    const [showConversionModal, setShowConversionModal] = useState(false);
    const [intentToConvert, setIntentToConvert] = useState(false);

    const handleToggleReward = () => {
        if (useLoyaltyReward) {
            // User is trying to turn it OFF -> Show Modal
            setShowConversionModal(true);
        } else {
            // User is turning it back ON
            setUseLoyaltyReward(true);
            setIntentToConvert(false);
        }
    };

    const confirmConversion = () => {
        setUseLoyaltyReward(false);
        setIntentToConvert(true);
        setShowConversionModal(false);
    };

    const cancelConversion = () => {
        setUseLoyaltyReward(true);
        setIntentToConvert(false);
        setShowConversionModal(false);
    };

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
            const finalLoyaltyId = clientId || localStorage.getItem('loyalty_client_id_v2');

            // Find the specific gift ID being used/converted
            const activeGift = loyaltyInfo.activeGifts?.[0]; // Support first available for now
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
                loyalty_gift_id: loyaltyGiftId,
                convertToPoints: intentToConvert
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

            // TRACKING: Persist for Tracker & Context
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
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const subtotal = getCartTotal();
    const { discount: orderDiscount, promo: orderPromo } = calculateOrderDiscount(promotions, subtotal);

    // Loyalty/Recovery Discount (using real config from context)
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
                    className={`fixed inset-0 z-[110] flex flex-col ${isDarkMode ? 'bg-[#0f0f0f]' : 'bg-[#f8f9fa]'}`}
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-gray-900'}`}
                        >
                            <HiChevronLeft size={24} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                if (window.confirm('Clear your cart?')) clearCart();
                            }}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm transition-colors ${isDarkMode ? 'bg-white/10 text-gray-400 hover:text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
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
                            <h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.success}</h2>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>{t.thanks}</p>
                        </div>
                    ) : (
                        <>
                            {/* Body */}
                            <div className="flex-1 px-6 overflow-y-auto no-scrollbar pb-32">
                                <div className="text-center mt-6 mb-8">
                                    <h1 className={`text-3xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`} dangerouslySetInnerHTML={{ __html: t.myCart }} />
                                    <div className={`h-1 w-12 mx-auto mt-2 rounded-full opacity-10 ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`} />

                                </div>

                                {cartItems.length === 0 ? (
                                    <>
                                        {/* Loyalty messages visible even when empty - SWITCH Implementation */}
                                        <div className="mb-8">
                                            {(() => {
                                                const uiState = loyaltyInfo?.uiState || 'ACTIVE_EARNING';
                                                const activeGifts = loyaltyInfo?.activeGifts || [];
                                                const gift = activeGifts.length > 0 ? activeGifts[0] : { type: 'PERCENTAGE', percentage_value: 10 };

                                                switch (uiState) {
                                                    case 'WELCOME':
                                                        return (
                                                            <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-3xl border-2 border-green-200 dark:border-green-700">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-2xl">👋</span>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-black text-sm text-green-700 dark:text-green-400">
                                                                            {translations[lang]?.auth?.welcomeTitle || "Welcome!"}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-green-600 dark:text-green-500">
                                                                            {getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.SESSION_1_AFTER_ORDER, language) || 'Join us to earn rewards'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );

                                                    case 'GIFT_AVAILABLE':
                                                        return (
                                                            <div className="flex justify-between items-center bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-5 rounded-3xl border-2 border-pink-200 dark:border-pink-700">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-2xl">🎁</span>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-black text-sm text-pink-700 dark:text-pink-400">
                                                                            {getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER, language, { percentage: gift.percentage_value || 10 }) || 'Welcome Back!'}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-pink-600 dark:text-pink-500">
                                                                            {getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.SESSION_2_AFTER_ORDER, language) || 'Valid for this session'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );

                                                    case 'ACTIVE_EARNING':
                                                    default:
                                                        return null;
                                                }
                                            })()}
                                        </div>

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
                                    </>
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
                                                    <h3 className={`font-bold text-lg leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                                                    <p className="text-gray-400 font-bold text-sm">
                                                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${Number(item.price).toFixed(2)}</span>
                                                        <span className="ml-2">x {item.quantity}</span>
                                                    </p>
                                                </div>

                                                {/* Vertical +/- Controls */}
                                                <div className={`flex flex-col items-center rounded-xl py-1 px-1 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`}
                                                    >
                                                        <span className="text-lg font-bold">+</span>
                                                    </button>
                                                    <div className="h-4 flex items-center justify-center">
                                                        <span className={`text-[10px] font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, Math.max(0, item.quantity - 1))}
                                                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`}
                                                    >
                                                        <span className="text-lg font-bold">-</span>
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
                                className={`rounded-t-[3rem] px-8 pt-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] space-y-4 border-t ${isDarkMode ? 'bg-[#1a1c23] border-white/5' : 'bg-white border-gray-50'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'} font-bold`}>{t.subtotal}</span>
                                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-lg`}>${subtotal.toFixed(2)}</span>
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
                                {loyaltyGift && (
                                    <div className={`flex justify-between items-center ${useLoyaltyReward ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400 dark:text-gray-500 opacity-60'}`}>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm">Loyalty Gift</span>
                                                <button
                                                    onClick={handleToggleReward}
                                                    className={`w-8 h-4 rounded-full relative transition-colors ${useLoyaltyReward ? 'bg-pink-500' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${useLoyaltyReward ? 'left-4.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                            <span className="text-[10px] italic font-medium">{loyaltyGift}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {useLoyaltyReward && <span className="text-[10px] font-black uppercase bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">Unlock</span>}
                                            <span className="font-black text-lg">$0.00</span>
                                        </div>
                                    </div>
                                )}

                                {(loyaltyDiscount > 0 || (isLoyal && !loyaltyGift)) && (
                                    <div className={`flex justify-between items-center ${useLoyaltyReward ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-400 dark:text-gray-500 opacity-60'}`}>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm">Loyalty Reward</span>
                                                <button
                                                    onClick={handleToggleReward}
                                                    className={`w-8 h-4 rounded-full relative transition-colors ${useLoyaltyReward ? 'bg-yellow-500' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${useLoyaltyReward ? 'left-4.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                            <span className="text-[10px] italic font-medium">{loyaltyReason || (messageKey ? getLoyaltyMessage(messageKey, language, messageVariables) : '')}</span>
                                        </div>
                                        <span className="font-black text-lg">-${(loyaltyDiscount || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                {isLoyal && messageKey && (
                                    <div className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-2xl border-2 border-amber-200 dark:border-amber-700">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">⭐</span>
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm text-amber-700 dark:text-amber-400">Loyal Client</span>
                                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500">
                                                    {getLoyaltyMessage(messageKey, language, messageVariables) || null}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {welcomeTeaser && messageKey && !isLoyal && (
                                    <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-2xl border-2 border-green-200 dark:border-green-700">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">🎉</span>
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm text-green-700 dark:text-green-400">
                                                    {loyaltyInfo?.uiState === 'WELCOME' ?
                                                        (translations[lang]?.auth?.welcomeTitle || "Welcome!") :
                                                        (translations[lang]?.auth?.welcomeBackTitle || "Welcome Back!")
                                                    }
                                                </span>
                                                <span className="text-[10px] font-bold text-green-600 dark:text-green-500">
                                                    {getLoyaltyMessage(messageKey, language, messageVariables) || null}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showProgress && (
                                    <LoyaltyProgressBar
                                        loyaltyConfig={loyaltyInfo?.config || {}}
                                        isDarkMode={isDarkMode}
                                        percentage={progressPercentage}
                                        progressMessage={messageKey ? getLoyaltyMessage(messageKey, language, messageVariables) : null}
                                    />
                                )}
                                {taxConfig.applyTax && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold">
                                            {t.taxes} ({taxConfig.taxPercentage}%)
                                        </span>
                                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-black text-lg`}>${tax.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className={`h-px bg-dashed my-2 border-t-2 border-dashed ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-gray-100 border-gray-100'}`} />
                                <div className="flex justify-between items-center pb-2">
                                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-xl font-black`}>{t.total}</span>
                                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-2xl font-black`}>${total.toFixed(2)}</span>
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
                    <ConversionConfirmationModal
                        isOpen={showConversionModal}
                        onConfirm={confirmConversion}
                        onCancel={cancelConversion}
                        isDarkMode={isDarkMode}
                        themeColor={themeColor}
                    />
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

const ConversionConfirmationModal = ({ isOpen, onConfirm, onCancel, isDarkMode, themeColor }) => (
    <AnimatePresence>
        {isOpen && (
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
                    className={`w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#1a1c23] text-white' : 'bg-white text-gray-900'}`}
                >
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl text-blue-500">💰</span>
                        </div>
                        <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Convert to Points?</h3>
                        <p className={`text-sm font-medium mb-8 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Are you sure you want to convert this reward into loyalty points?
                            <br />
                            <span className="font-bold text-blue-500">This action is irreversible.</span>
                        </p>

                        <div className="space-y-3">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onConfirm}
                                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-black uppercase tracking-wider shadow-lg shadow-blue-500/25"
                            >
                                Yes, Convert
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onCancel}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                No, Keep Reward
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default Checkout;
