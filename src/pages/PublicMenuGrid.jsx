import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiBars3, HiBuildingStorefront, HiXMark, HiTrash, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import Checkout from '../components/menu/Checkout';
import Cart from '../components/menu/Cart';
import WelcomeSequence from '../components/public-menu/WelcomeSequence';
import { useClientAuth } from '../context/ClientAuthContext';
import PersistentOrderTracker from '../components/PersistentOrderTracker';
import { useLanguage } from '../context/LanguageContext';
import { isPromoActive, getDiscountedPrice, getPromosByDisplayStyle } from '../utils/promoUtils';
import { HiTag, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const PublicMenuGrid = ({ restaurantName: propRestaurantName, templateKey: propTemplateKey }) => {
    const { user: clientUser, activeOrderId, activeOrder, handleCloseTracker, isTopTrackerHidden } = useClientAuth();
    const { restaurantName: urlRestaurantName, templateKey: urlTemplateKey } = useParams();
    const restaurantName = propRestaurantName || urlRestaurantName;
    const templateKey = propTemplateKey || urlTemplateKey || 'pizza1';
    const isMasterView = !restaurantName;

    // State
    const [menuItems, setMenuItems] = useState([]);
    const [config, setConfig] = useState({
        restaurantName: 'Menu Preview',
        themeColor: '#6366f1',
        logoImage: null,
        useLogo: false,
        promotions: []
    });
    const { t, localize } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuthSidebar, setShowAuthSidebar] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [showBadgePromos, setShowBadgePromos] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeCategory, setActiveCategory] = useState('All');

    const { cartItems, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, getCartTotal } = useCart();

    // Auto-swipe for banners
    useEffect(() => {
        const bannerPromos = getPromosByDisplayStyle(config.promotions || [], 'banner');
        if (bannerPromos.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % bannerPromos.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [config.promotions]);

    // Fetch Menu Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (isMasterView) {
                    const response = await fetch(`/.netlify/functions/templates?templateKey=${templateKey}`);
                    const data = await response.json();
                    if (data && data.items) {
                        setMenuItems(data.items.map(item => ({ ...item, image: item.image_url })));
                        setConfig({
                            restaurantName: data.name || 'MASTER BLUEPRINT',
                            themeColor: data.config?.designConfig?.accentColor || data.config?.themeColor || '#6366f1',
                            logoImage: null,
                            useLogo: false,
                            promotions: data.config?.promotions || []
                        });
                    }
                } else {
                    const response = await fetch(`/.netlify/functions/public-menu?restaurantName=${encodeURIComponent(restaurantName)}`);
                    if (!response.ok) throw new Error('Failed to load menu');
                    const data = await response.json();
                    if (data.menu && data.menu.config) {
                        setMenuItems(data.menu.config.items || []);
                        setConfig({
                            ...data.menu.config,
                            restaurantName: data.menu.config.restaurantName || data.restaurant || restaurantName,
                            promotions: data.menu.config.promotions || []
                        });
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [restaurantName, isMasterView, templateKey]);

    useEffect(() => {
        if (menuItems.length > 0 && !selectedItem) {
            setSelectedItem(menuItems[0]);
        }
    }, [menuItems]);

    const categories = ['All', ...new Set(menuItems.map(item => localize(item, 'category')))];
    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => localize(item, 'category') === activeCategory);

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 flex flex-col md:flex-row overflow-hidden relative">
            {activeOrder && !isTopTrackerHidden && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
                <PersistentOrderTracker
                    order={activeOrder}
                    onClose={handleCloseTracker}
                    themeColor={config.themeColor}
                />
            )}
            <style>{`
                :root { --theme-color: ${config.themeColor}; }
                .text-theme { color: var(--theme-color); }
                .bg-theme { background-color: var(--theme-color); }
                .border-theme { border-color: var(--theme-color); }
            `}</style>

            {/* Left Sidebar / Thumbnail List */}
            <div className="relative shrink-0 z-40 bg-white/90 backdrop-blur-md w-24 md:w-32 lg:w-40 h-full flex flex-col items-center py-6 overflow-y-auto scroll-smooth no-scrollbar shadow-xl transition-all duration-300">
                <div className="flex flex-col gap-4 w-full px-3">
                    {filteredItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setSelectedItem(item); setQuantity(1); }}
                            className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-500 group ${selectedItem?.id === item.id ? 'ring-4 ring-offset-2 ring-theme scale-95 shadow-lg' : 'hover:scale-105 opacity-60 hover:opacity-100 shadow-sm'}`}
                        >
                            <img src={item.image} alt={localize(item, 'name')} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className={`absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors ${selectedItem?.id === item.id ? 'bg-transparent' : ''}`} />
                        </button>
                    ))}
                </div>

                {/* Profile Button */}
                <button
                    onClick={() => setShowAuthSidebar(true)}
                    className="mt-auto mb-6 p-4 rounded-2xl bg-white shadow-lg border border-gray-100 hover:scale-110 active:scale-95 transition-all text-gray-500 hover:text-theme"
                >
                    <HiBars3 className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden shadow-2xl z-30">
                {/* Dynamic Category Bar */}
                <div className="px-6 py-4 flex flex-col gap-4 border-b border-gray-100 bg-white shadow-sm z-20">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-theme text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            >
                                {cat === 'All' ? t('auth.menu.all') : cat}
                            </button>
                        ))}
                    </div>

                    {/* Banner Promotions */}
                    {(() => {
                        const bannerPromos = getPromosByDisplayStyle(config.promotions || [], 'banner');
                        if (bannerPromos.length > 0) {
                            const currentPromo = bannerPromos[currentBannerIndex % bannerPromos.length];
                            return (
                                <div className="relative h-28 rounded-2xl overflow-hidden shadow-sm group bg-gray-50 border border-gray-100">
                                    {currentPromo.promoImage && (
                                        <img src={currentPromo.promoImage} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentBannerIndex}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="relative z-10 p-5 flex flex-col justify-center h-full"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <HiTag className="text-theme w-4 h-4" />
                                                <span className="text-[10px] font-black text-theme uppercase tracking-widest">Special offer</span>
                                            </div>
                                            <h3 className="text-gray-900 font-black text-lg leading-tight">{currentPromo.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-500 text-xs italic font-medium truncate max-w-[200px]">{currentPromo.promoText}</p>
                                                <span className="bg-theme text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                                                    {currentPromo.discountType === 'percentage' ? `${currentPromo.discountValue}% OFF` : `$${currentPromo.discountValue} OFF`}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>

                                    {bannerPromos.length > 1 && (
                                        <div className="absolute bottom-2 right-4 flex gap-1">
                                            {bannerPromos.map((_, i) => (
                                                <div key={i} className={`h-1 rounded-full transition-all ${i === (currentBannerIndex % bannerPromos.length) ? 'w-4 bg-theme' : 'w-1 bg-gray-200'}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* Content */}
                {selectedItem && (
                    <div className="flex-1 flex flex-col relative animate-fade-in group/main overflow-hidden">
                        <div className="flex-1 relative overflow-hidden bg-gray-50 flex items-center justify-center p-8">
                            <div className="relative w-full max-w-lg aspect-square">
                                <img src={selectedItem.image} alt={localize(selectedItem, 'name')}
                                    className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-1000 group-hover/main:scale-105" />
                            </div>
                        </div>

                        {/* Item Details */}
                        <div className="p-8 space-y-4 bg-white">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="bg-theme/10 text-theme px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{localize(selectedItem, 'category')}</span>
                                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight leading-none">{localize(selectedItem, 'name')}</h1>
                                    <p className="text-gray-500 font-medium leading-relaxed max-w-md" dangerouslySetInnerHTML={{ __html: localize(selectedItem, 'description') }} />
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('auth.checkout.price')}</span>
                                    {(() => {
                                        const { finalPrice, discount, originalPrice, promo } = getDiscountedPrice(config.promotions || [], selectedItem);
                                        return (
                                            <div className="flex flex-col items-end">
                                                {discount > 0 && <span className="text-sm text-gray-400 line-through font-bold">${parseFloat(originalPrice).toFixed(2)}</span>}
                                                <span className="text-3xl font-black text-theme">${parseFloat(finalPrice).toFixed(2)}</span>
                                                {promo && <span className="text-[10px] text-theme font-black uppercase mt-1">🏷️ {promo.name}</span>}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4 bg-gray-100 rounded-2xl p-2 px-4">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 hover:text-theme transition-colors"><HiMinus className="w-5 h-5" /></button>
                                    <span className="w-8 text-center font-black text-lg">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="p-2 hover:text-theme transition-colors"><HiPlus className="w-5 h-5" /></button>
                                </div>
                                <button
                                    onClick={() => {
                                        const { finalPrice } = getDiscountedPrice(config.promotions || [], selectedItem);
                                        addToCart({ ...selectedItem, price: finalPrice, quantity });
                                        setIsCartOpen(true);
                                    }}
                                    className="flex-1 ml-6 h-14 bg-theme text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                >
                                    <HiShoppingBag className="w-6 h-6" /> {t('auth.menu.addToCart')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cart Button (Floating) */}
            <button
                onClick={() => setIsCartOpen(true)}
                className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center text-gray-900 hover:scale-110 active:scale-90 transition-all group"
            >
                <div className="relative">
                    <HiShoppingBag className="w-7 h-7" />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-3 -right-3 w-6 h-6 bg-theme text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white">
                            {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                        </span>
                    )}
                </div>
            </button>

            {/* Badge Promotions Trigger */}
            {(() => {
                const badgePromos = getPromosByDisplayStyle(config.promotions || [], 'badge');
                if (badgePromos.length > 0) {
                    return (
                        <motion.button
                            onClick={() => setShowBadgePromos(true)}
                            className="fixed bottom-28 right-8 z-[60] w-16 h-16 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center justify-center text-theme hover:scale-110 active:scale-90 transition-all"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            <HiTag className="w-7 h-7" />
                            <span className="text-[10px] font-black uppercase">{badgePromos.length}</span>
                        </motion.button>
                    );
                }
                return null;
            })()}

            {/* Sidebars */}
            <PublicMenuSidebar
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName={restaurantName}
                displayName={config.restaurantName}
                themeColor={config.themeColor}
            />

            <Checkout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                restaurantName={restaurantName}
                themeColor={config.themeColor}
                promotions={config.promotions || []}
                taxConfig={{ applyTax: config.applyTax, taxPercentage: config.taxPercentage }}
            />

            <Cart onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />

            {/* Badge Promotions List Modal */}
            <AnimatePresence>
                {showBadgePromos && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBadgePromos(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Active Offers</h2>
                                    <button onClick={() => setShowBadgePromos(false)} className="text-gray-400 hover:text-gray-900"><HiXMark className="w-6 h-6" /></button>
                                </div>
                                <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
                                    {getPromosByDisplayStyle(config.promotions || [], 'badge').map(promo => (
                                        <div key={promo.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
                                            <div className="flex items-center gap-4">
                                                {promo.promoImage ? (
                                                    <img src={promo.promoImage} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-theme/10 flex items-center justify-center text-xl text-theme">🏷️</div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 truncate">{promo.name}</h3>
                                                    <p className="text-xs text-gray-500 italic truncate">{promo.promoText}</p>
                                                </div>
                                                <div className="text-theme font-black text-sm whitespace-nowrap">
                                                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setShowBadgePromos(false)} className="w-full mt-6 py-4 bg-theme text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">Got it!</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <WelcomeSequence
                restaurantName={config.restaurantName}
                themeColor={config.themeColor}
                promoConfig={config}
            />
        </div>
    );
};

export default PublicMenuGrid;
