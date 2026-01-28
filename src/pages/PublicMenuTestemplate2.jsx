import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiBars3, HiMagnifyingGlass, HiAdjustmentsHorizontal,
    HiHome, HiHeart, HiShoppingBag, HiUser,
    HiStar, HiClock, HiFire, HiPlus, HiMinus, HiArrowLeft
} from 'react-icons/hi2';
import { useLanguage } from '../context/LanguageContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import Checkout from '../components/menu/Checkout';
import WelcomeSequence from '../components/public-menu/WelcomeSequence';
import { isPromoActive, getDiscountedPrice, getPromosByDisplayStyle, getPromoFilteredItems } from '../utils/promoUtils';
import { HiTag, HiChevronLeft, HiChevronRight, HiXMark, HiArrowUturnLeft } from 'react-icons/hi2';

const PublicMenuTestemplate2 = ({ restaurantName: propRestaurantName }) => {
    const { restaurantName: urlRestaurantName } = useParams();
    const restaurantName = propRestaurantName || urlRestaurantName;
    const isMasterView = !restaurantName;

    // State
    const [menuItems, setMenuItems] = useState([]);
    const [config, setConfig] = useState({
        restaurantName: 'Fast Food King',
        themeColor: '#F97316', // Orange
        location: 'New York, USA'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [favorites, setFavorites] = useState([]);
    const [showAuthSidebar, setShowAuthSidebar] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [showBadgePromos, setShowBadgePromos] = useState(false);
    const [selectedPromoId, setSelectedPromoId] = useState(null);

    // Cart
    const { addToCart, cartItems } = useCart();
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const { t, localize } = useLanguage();

    useEffect(() => {
        const bannerPromos = getPromosByDisplayStyle(config.promotions || [], 'banner');
        if (bannerPromos.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % bannerPromos.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [config.promotions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                let data;
                if (isMasterView) {
                    const response = await fetch('/.netlify/functions/templates?templateKey=testemplate2');
                    data = await response.json();
                    if (data && data.items) {
                        setMenuItems(data.items.map(enhanceItem));
                        setConfig(prev => ({
                            ...prev,
                            restaurantName: data.name,
                            themeColor: data.config?.themeColor || '#F97316'
                        }));
                    }
                } else {
                    const response = await fetch(`/.netlify/functions/public-menu?restaurantName=${encodeURIComponent(restaurantName)}`);
                    if (!response.ok) throw new Error('Failed to load menu');
                    data = await response.json();
                    if (data.menu && data.menu.config) {
                        const items = data.menu.config.items || [];
                        setMenuItems(items.map(enhanceItem));
                        setConfig({
                            ...data.menu.config,
                            restaurantName: data.menu.config.restaurantName || data.restaurant || restaurantName,
                            themeColor: data.menu.config.themeColor || '#F97316'
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
    }, [restaurantName, isMasterView]);

    // Helper to add mock metadata if missing
    const enhanceItem = (item) => ({
        ...item,
        image: item.image_url || item.image,
        rating: item.rating || (4.0 + Math.random()).toFixed(1),
        time: item.time || `${15 + Math.floor(Math.random() * 20)}min`,
        calories: item.calories || `${200 + Math.floor(Math.random() * 400)} kcal`
    });

    const activePromo = selectedPromoId ? (config.promotions || []).find(p => p.id === selectedPromoId) : null;
    const categories = ['All', ...new Set(menuItems.map(i => localize(i, 'category')).filter(Boolean))];
    const filteredItems = activePromo
        ? getPromoFilteredItems(activePromo, menuItems)
        : menuItems.filter(item => activeCategory === 'All' || localize(item, 'category') === activeCategory);

    useEffect(() => {
        if (activePromo && filteredItems.length > 0) {
            handleItemClick(filteredItems[0]);
        }
    }, [selectedPromoId]);

    // Handlers
    const handleItemClick = (item) => {
        setSelectedItem(item);
        setQuantity(1);
    };

    const handleAddToCartFromList = (item, price) => {
        addToCart({ ...item, price: price || item.price, quantity: 1 });
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            const { finalPrice } = getDiscountedPrice(config.promotions || [], selectedItem);
            addToCart({ ...selectedItem, price: finalPrice, quantity });
            setSelectedItem(null);
        }
    };

    const toggleFavorite = (e, itemId) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-orange-500 font-bold">{t('auth.menu.loading')}</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-24 relative overflow-hidden" style={{ '--theme-color': config.themeColor }}>

            {/* Header */}
            <header className="px-6 pt-6 pb-2 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => setShowAuthSidebar(true)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <HiBars3 className="w-6 h-6 text-gray-700" />
                </button>
                <div className="text-center">
                    <h5 className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('auth.menu.location')}</h5>
                    <div className="text-sm font-bold text-gray-800 flex items-center gap-1">
                        <span className="text-theme">📍</span> {config.location || 'Unknown'}
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full object-cover" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-6 pt-6">
                {/* Banner Promotions */}
                {config.promotions && config.promotions.length > 0 && !selectedPromoId && (
                    <div className="mb-8">
                        <div className="relative h-44 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-[#12141a]">
                            <AnimatePresence mode="wait">
                                {getPromosByDisplayStyle(config.promotions, 'banner').map((promo, idx) => idx === currentBannerIndex && (
                                    <motion.div
                                        key={promo.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="absolute inset-0 cursor-pointer"
                                        onClick={() => setSelectedPromoId(promo.id)}
                                        style={{
                                            backgroundColor: promo.backgroundType === 'image' ? 'transparent' : (promo.backgroundColor || config.themeColor)
                                        }}
                                    >
                                        {promo.backgroundType === 'image' ? (
                                            <>
                                                <img src={promo.promoImage} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            </>
                                        ) : (
                                            <>
                                                {promo.decorationImage && (
                                                    <motion.img
                                                        initial={{ scale: 0.8, opacity: 0, x: promo.decorationPosition === 'left' ? -20 : 20 }}
                                                        animate={{ scale: 1, opacity: 1, x: 0 }}
                                                        src={promo.decorationImage}
                                                        alt=""
                                                        className={`absolute top-0 h-full w-auto object-contain pointer-events-none z-10 ${promo.decorationPosition === 'left' ? 'left-0' : 'right-0'}`}
                                                    />
                                                )}
                                            </>
                                        )}

                                        <div className="relative h-full p-8 flex flex-col justify-end text-white z-20">
                                            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                                                <div className="p-1 px-3 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black w-fit mb-2 uppercase tracking-[0.2em]">Promotion</div>
                                                <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">{promo.name}</h3>
                                                <p className="text-sm font-bold opacity-80 italic">{promo.promoText}</p>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Active Filter Identifier */}
                {activePromo && (
                    <div className="mb-8 p-6 bg-white/5 rounded-[2rem] border border-orange-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-500">
                                <HiTag className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1 leading-none">Filtering by offer</p>
                                <h3 className="text-lg font-black text-white leading-none uppercase">{activePromo.name}</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedPromoId(null)}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-95"
                        >
                            <HiArrowUturnLeft className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <header className="mb-8">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                        {t('auth.menu.popular')} <span className="text-[#F97316]">Food</span>
                    </h1>
                    <p className="text-white/40 text-sm font-medium uppercase tracking-widest">{config.location}</p>
                </header>

                {/* Categories */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-4 rounded-3xl font-black uppercase tracking-widest text-xs transition-all ${activeCategory === cat
                                ? 'bg-[#F97316] text-white shadow-xl shadow-orange-500/20'
                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                                }`}
                        >
                            {cat === 'All' ? t('auth.menu.all') : cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-6">
                    {filteredItems.map((item) => {
                        const { finalPrice, discount, originalPrice, promo } = getDiscountedPrice(config.promotions || [], item);
                        const hasDiscount = discount > 0;

                        return (
                            <motion.div
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className="bg-white/5 rounded-[2.5rem] p-5 relative group cursor-pointer hover:bg-white/10 transition-colors"
                                whileHover={{ y: -5 }}
                            >
                                {hasDiscount && (
                                    <div className="absolute -top-2 -left-2 bg-[#F97316] text-white text-[10px] font-black px-3 py-1.5 rounded-2xl z-10 shadow-xl rotate-[-5deg]">
                                        {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
                                    </div>
                                )}
                                <button className="absolute top-5 right-5 text-white/20 hover:text-red-500 transition-colors z-10">
                                    <HiHeart className="w-5 h-5" />
                                </button>
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full scale-150 group-hover:bg-orange-500/20 transition-all"></div>
                                    <img src={item.image} alt={localize(item, 'name')} className="w-full h-32 object-contain relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <h3 className="text-white font-black uppercase tracking-tight text-sm mb-1 truncate">{localize(item, 'name')}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <HiStar className="text-orange-500 w-3 h-3" />
                                    <span className="text-white/40 text-[10px] font-black">{item.rating}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        {hasDiscount && <span className="text-white/20 line-through text-[10px] font-black">${parseFloat(originalPrice).toFixed(2)}</span>}
                                        <span className="text-white font-black text-xl tracking-tighter">${parseFloat(finalPrice).toFixed(2)}</span>
                                    </div>
                                    <button
                                        className="w-10 h-10 bg-[#F97316] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCartFromList(item, finalPrice);
                                        }}
                                    >
                                        <HiPlus className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            {/* Floating Badge Promo Trigger */}
            {(() => {
                const badgePromos = getPromosByDisplayStyle(config.promotions || [], 'badge');
                if (badgePromos.length > 0 && !selectedPromoId) {
                    return (
                        <motion.button
                            onClick={() => {
                                const badgePromos = getPromosByDisplayStyle(config.promotions || [], 'badge');
                                if (badgePromos.length === 1) {
                                    setSelectedPromoId(badgePromos[0].id);
                                } else {
                                    setShowBadgePromos(true);
                                }
                            }}
                            className="fixed top-20 right-8 z-40 bg-[#F97316] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em]"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            layoutId="floating-badge"
                        >
                            <HiTag className="w-5 h-5" />
                            <span>{badgePromos.length} Offers</span>
                        </motion.button>
                    );
                }
                return null;
            })()}

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center z-40 pb-8">
                <button className="flex flex-col items-center gap-1 text-theme" style={{ color: config.themeColor }}>
                    <HiHome className="w-6 h-6" />
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-gray-500 transition-colors">
                    <HiHeart className="w-6 h-6" />
                </button>

                <div className="relative -top-8">
                    <button
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-14 h-14 bg-theme rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-200 active:scale-95 transition-transform"
                        style={{ backgroundColor: config.themeColor }}
                    >
                        <HiShoppingBag className="w-6 h-6" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-gray-500 transition-colors">
                    <HiUser className="w-6 h-6" />
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-gray-500 transition-colors">
                    <HiBars3 className="w-6 h-6" />
                </button>
            </div>

            {/* Item Details Overlay */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-50 bg-white flex flex-col"
                    >
                        <div className="h-1/2 relative bg-gray-100">
                            <motion.img
                                layoutId={`image-${selectedItem.id}`}
                                src={selectedItem.image}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-white bg-gradient-to-b from-black/20 to-transparent">
                                <button onClick={() => setSelectedItem(null)} className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-colors">
                                    <HiArrowLeft className="w-6 h-6" />
                                </button>
                                <button className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-colors">
                                    <HiHeart className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 -mt-10 bg-white rounded-t-[2.5rem] relative px-8 pt-12 pb-8 flex flex-col">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full absolute top-4 left-1/2 -translate-x-1/2" />

                            <header className="mb-10 text-center">
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-1">{localize(selectedItem, 'name')}</h2>
                                {(() => {
                                    const { finalPrice, discount, originalPrice, promo } = getDiscountedPrice(config.promotions || [], selectedItem);
                                    return (
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-4">
                                                {discount > 0 && <span className="text-gray-300 line-through font-black text-lg font-mono">${parseFloat(originalPrice).toFixed(2)}</span>}
                                                <span className="text-4xl font-black text-[#F97316] tracking-tighter font-mono">${parseFloat(finalPrice).toFixed(2)}</span>
                                            </div>
                                            {promo && (
                                                <div className="mt-2 bg-[#F97316]/10 text-[#F97316] px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-[#F97316]/20 flex items-center gap-2">
                                                    <HiTag className="w-4 h-4" /> {promo.name}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </header>

                            <div className="flex items-center gap-6 mt-4 mb-6">
                                <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                                    <HiStar className="w-5 h-5 text-yellow-400" /> {selectedItem.rating}
                                </span>
                                <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                                    <HiFire className="w-5 h-5 text-red-500" /> {selectedItem.calories}
                                </span>
                                <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                                    <HiClock className="w-5 h-5 text-blue-400" /> {selectedItem.time}
                                </span>
                            </div>

                            <p className="text-gray-500 leading-relaxed text-sm flex-1 overflow-y-auto mb-6" dangerouslySetInnerHTML={{ __html: localize(selectedItem, 'description') }} />
                            {/* About section header removed as per template style, but description remains */}

                            <div className="flex items-center gap-6 mt-auto">
                                <div className="flex items-center gap-4 bg-gray-100 rounded-2xl px-4 py-3">
                                    {quantity > 1 && (
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-red-500 transition-colors">
                                            <HiMinus className="w-5 h-5" />
                                        </button>
                                    )}
                                    <span className="font-black text-lg w-6 text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-green-500 transition-colors">
                                        <HiPlus className="w-5 h-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 py-4 bg-theme text-white font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all text-sm uppercase tracking-widest"
                                    style={{ backgroundColor: config.themeColor }}
                                >
                                    {t('menu.addToCart')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PublicMenuSidebar isOpen={showAuthSidebar} onClose={() => setShowAuthSidebar(false)} restaurantName={restaurantName} displayName={config.restaurantName} themeColor={config.themeColor} />
            <Checkout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                restaurantName={restaurantName}
                themeColor={config.themeColor}
                promotions={config.promotions || []}
                taxConfig={{ applyTax: config.applyTax, taxPercentage: config.taxPercentage }}
            />

            {/* Floating Badge Promotions List */}
            <AnimatePresence>
                {showBadgePromos && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBadgePromos(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-[#1a1c23] w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Exclusive <span className="text-orange-500">Offers</span></h2>
                                    <button onClick={() => setShowBadgePromos(false)} className="p-2 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-colors">
                                        <HiXMark className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                                    {getPromosByDisplayStyle(config.promotions || [], 'badge').map((promo) => (
                                        <div
                                            key={promo.id}
                                            onClick={() => {
                                                setSelectedPromoId(promo.id);
                                                setShowBadgePromos(false);
                                            }}
                                            className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col gap-4 cursor-pointer hover:bg-white/10 transition-all active:scale-95"
                                        >
                                            <div className="flex items-center gap-5">
                                                {promo.promoImage ? (
                                                    <img src={promo.promoImage} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-2xl" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-3xl shadow-inner">🍔</div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-black text-white uppercase tracking-tight">{promo.name}</h3>
                                                        <span className="text-orange-500 font-black font-mono">{promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}</span>
                                                    </div>
                                                    <p className="text-sm text-white/40 font-medium italic">{promo.promoText}</p>
                                                </div>
                                            </div>
                                            {promo.requiresCode && (
                                                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-dashed border-orange-500/30 text-xs">
                                                    <span className="text-white/20 font-black uppercase tracking-widest">Code</span>
                                                    <span className="font-black tracking-[0.3em] text-orange-500 uppercase">{promo.promoCode}</span>
                                                </div>
                                            )}
                                            <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest text-center mt-2 border-t border-white/5 pt-2">
                                                Click to view items ➔
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={() => setShowBadgePromos(false)} className="w-full mt-8 py-5 bg-orange-500 text-white font-black rounded-3xl shadow-2xl shadow-orange-500/30 active:scale-95 transition-all uppercase tracking-[0.3em] text-xs">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <WelcomeSequence restaurantName={config.restaurantName} themeColor={config.themeColor} promoConfig={config} />

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .text-theme { color: var(--theme-color); }
                .bg-theme { background-color: var(--theme-color); }
                .hover\\:bg-theme:hover { background-color: var(--theme-color); }
            `}</style>
        </div>
    );
};

export default PublicMenuTestemplate2;
