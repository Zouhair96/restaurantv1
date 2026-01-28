
import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiMapPin, HiMagnifyingGlass, HiAdjustmentsHorizontal, HiHome, HiChatBubbleLeftRight, HiBell, HiUserGroup, HiXMark, HiTag, HiChevronLeft, HiChevronRight, HiArrowUturnLeft } from 'react-icons/hi2';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import Checkout from '../components/menu/Checkout'; // Import Checkout
import PersistentOrderTracker from '../components/PersistentOrderTracker';
import { useClientAuth } from '../context/ClientAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isPromoActive, getDiscountedPrice, getPromosByDisplayStyle, getPromoFilteredItems } from '../utils/promoUtils';

const PublicMenuTestemplate = ({ restaurantName: propRestaurantName }) => {
    const { restaurantName: urlRestaurantName } = useParams();
    const restaurantName = propRestaurantName || urlRestaurantName;
    const isMasterView = !restaurantName;

    const [menuItems, setMenuItems] = useState([]);
    const [config, setConfig] = useState({
        restaurantName: 'Healthy Point',
        themeColor: '#22c55e',
        logoImage: null,
        useLogo: false,
        location: 'Khulna, BD',
        promotions: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeCategory, setActiveCategory] = useState('All');
    const [isLiked, setIsLiked] = useState(false);
    const [showAuthSidebar, setShowAuthSidebar] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // State for checkout
    const [animatingItems, setAnimatingItems] = useState([]); // For fly-to-cart effect
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0); // For banner carousel
    const [showBadgePromos, setShowBadgePromos] = useState(false); // For floating badge modal
    const [selectedPromoId, setSelectedPromoId] = useState(null);
    const cartControls = useAnimation(); // For vibration effect
    const dragY = useMotionValue(0);
    const homeOpacity = useTransform(dragY, [-200, 0, 200], [1, 0.4, 1]);
    const homeScale = useTransform(dragY, [-200, 0, 200], [1, 0.95, 1]);
    const homeY = useTransform(dragY, [-200, 0, 200], [0, 50, 0]);

    // Derived state for categories
    const { localize, t } = useLanguage();
    const categories = ['All', ...new Set(menuItems.map(i => localize(i, 'category')).filter(Boolean))];

    const { addToCart, cartItems } = useCart();
    const { user: clientUser, activeOrder, handleCloseTracker, isTopTrackerHidden } = useClientAuth();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (isMasterView) {
                    const response = await fetch('/.netlify/functions/templates?templateKey=testemplate');
                    const data = await response.json();
                    if (data && data.items) {
                        setMenuItems(data.items.map(item => ({
                            ...item,
                            image: item.image_url,
                            rating: item.rating || (4.0 + Math.random()).toFixed(1),
                            time: item.time || '20min',
                            calories: item.calories || '150 Kcal'
                        })));
                        setConfig(prev => ({
                            ...prev,
                            themeColor: data.config?.themeColor || '#22c55e',
                            restaurantName: data.name || 'Test Template'
                        }));
                    }
                } else {
                    const response = await fetch(`/.netlify/functions/public-menu?restaurantName=${encodeURIComponent(restaurantName)}`);
                    if (!response.ok) throw new Error('Failed to load menu');
                    const data = await response.json();
                    if (data.menu && data.menu.config) {
                        setMenuItems((data.menu.config.items || []).map(item => ({
                            ...item,
                            image: item.image || item.image_url,
                            rating: item.rating || '4.5',
                            time: item.time || '15min',
                            calories: item.calories || '200 Kcal'
                        })));
                        setConfig({
                            ...data.menu.config,
                            restaurantName: data.menu.config.restaurantName || data.restaurant || restaurantName,
                            themeColor: data.menu.config.themeColor || '#22c55e'
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

    useEffect(() => {
        if (categories.length > 0 && !categories.includes(activeCategory)) {
            setActiveCategory(categories[0]);
        }
    }, [categories, activeCategory]);

    const [searchQuery, setSearchQuery] = useState('');

    const handleCloseDetail = () => {
        setSelectedItem(null);
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setQuantity(1);
    };

    const activePromo = selectedPromoId ? (config.promotions || []).find(p => p.id === selectedPromoId) : null;

    // Helper to detect video files
    const isMediaVideo = (url) => {
        if (!url) return false;
        return url.match(/\.(mp4|webm|ogg|mov)$/i);
    };

    const filteredMenuItems = menuItems.filter(item => {
        if (!item) return false;

        // Category & Search filter
        const categoryMatch = activeCategory === 'All' || localize(item, 'category') === activeCategory;
        const searchMatch = localize(item, 'name').toLowerCase().includes(searchQuery.toLowerCase());

        // Promotion filter
        let promoMatch = true;
        if (activePromo) {
            promoMatch = getPromoFilteredItems(activePromo, menuItems).some(promoItem => String(promoItem.id) === String(item.id));
        }

        return categoryMatch && searchMatch && promoMatch;
    });

    // Removed auto-item select on promo change as requested by user

    const triggerCartAnimation = async (item, event) => {
        // Trigger vibration
        cartControls.start({
            scale: [1, 1.2, 0.9, 1.1, 1],
            rotate: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.4 }
        });

        // Add to animating items
        const id = Date.now();
        const startPos = event ? { x: event.clientX, y: event.clientY } : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        // Target is the cart icon - roughly top right
        // In a real app we'd use a ref to get exact coords, but let's approximate for now
        const targetPos = { x: window.innerWidth - 60, y: 32 };

        setAnimatingItems(prev => [...prev, { id, image: item.image, startPos, targetPos }]);

        // Remove after animation finishes
        setTimeout(() => {
            setAnimatingItems(prev => prev.filter(a => a.id !== id));
        }, 800);
    };

    // Auto-swipe for promotion banners
    useEffect(() => {
        const bannerPromos = getPromosByDisplayStyle(config.promotions || [], 'banner');
        if (bannerPromos.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % bannerPromos.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [config.promotions]);

    const handleAddToCart = (e) => {
        if (selectedItem) {
            addToCart({ ...selectedItem, quantity });
            triggerCartAnimation(selectedItem, e);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    };

    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollContainerRef = React.useRef(null);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            setShowScrollTop(scrollTop > clientHeight * 0.2);
        }
    };

    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-green-500">{t('auth.menu.loading')}</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800 relative overflow-hidden" style={{ '--theme-color': config.themeColor }}>
            <style>{`
                .text-theme { color: var(--theme-color) !important; }
                .bg-theme { background-color: var(--theme-color) !important; }
                .border-theme { border-color: var(--theme-color) !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* --- FIXED HEADER --- */}
            <div className="h-16 bg-white/95 backdrop-blur-md z-[60] flex items-center justify-between px-6 shrink-0 shadow-sm relative transition-all duration-300">
                {/* Menu Toggle */}
                <button
                    onClick={() => setShowAuthSidebar(!showAuthSidebar)}
                    className="p-3 rounded-[1rem] border shadow-sm active:scale-95 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors z-50"
                    style={{
                        color: config.themeColor,
                        borderColor: `${config.themeColor}20`,
                    }}
                >
                    <div className="w-6 h-6 flex flex-col justify-around py-0.5">
                        <motion.span
                            animate={showAuthSidebar ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                            className="block h-0.5 w-6 bg-current rounded-full"
                            style={{ backgroundColor: config.themeColor }}
                        />
                        <motion.span
                            animate={showAuthSidebar ? { opacity: 0 } : { opacity: 1 }}
                            className="block h-0.5 w-6 bg-current rounded-full"
                            style={{ backgroundColor: config.themeColor }}
                        />
                        <motion.span
                            animate={showAuthSidebar ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                            className="block h-0.5 w-6 bg-current rounded-full"
                            style={{ backgroundColor: config.themeColor }}
                        />
                    </div>
                </button>

                {/* Restaurant Name */}
                <h1 className="text-xl font-bold text-gray-900 text-center flex-1 mx-4 truncate">{config.restaurantName}</h1>

                {/* Cart Icon */}
                <motion.button
                    animate={cartControls}
                    onClick={() => setIsCheckoutOpen(true)}
                    className="relative p-3 rounded-[1rem] border shadow-sm active:scale-95 flex items-center justify-center bg-white text-gray-700 hover:text-theme transition-colors"
                    style={{
                        borderColor: `${config.themeColor}20`,
                    }}
                >
                    <HiShoppingBag className="w-6 h-6" />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                            {cartItems.length}
                        </span>
                    )}
                </motion.button>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <motion.div
                className="flex-1 flex flex-col h-full overflow-hidden relative z-0 origin-center"
                animate={{
                    scale: isCheckoutOpen ? 0.94 : (selectedItem ? 0.95 : 1),
                    opacity: isCheckoutOpen ? 0.4 : (selectedItem ? 0.4 : 1),
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                style={{
                    opacity: (!isCheckoutOpen && selectedItem) ? homeOpacity : undefined,
                    scale: (!isCheckoutOpen && selectedItem) ? homeScale : undefined,
                    y: (!isCheckoutOpen && selectedItem) ? homeY : undefined,
                }}
            >
                <div
                    className="flex-1 overflow-y-auto pb-24 scroll-smooth"
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                >

                    {/* Search Bar */}
                    <div className="px-6 mt-6 flex gap-4">
                        <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-3 shadow-sm">
                            <HiMagnifyingGlass className="w-6 h-6 text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder={t('auth.menu.search')}
                                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Promotion Banner */}
                    {config.promotions && getPromosByDisplayStyle(config.promotions, 'banner').length > 0 && !selectedPromoId && (
                        <div className="px-6 mb-8 mt-2 relative z-30">
                            <div className="relative h-32 md:h-36 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 bg-gray-900">
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
                                                    {isMediaVideo(promo.promoImage) ? (
                                                        <video src={promo.promoImage} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={promo.promoImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                                    )}
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${promo.decorationPosition === 'left' ? 'from-transparent via-black/20 to-black/80' : 'from-black/80 via-black/20 to-transparent'}`} />
                                                </>
                                            ) : (
                                                <>
                                                    {promo.decorationImage && (
                                                        <motion.div
                                                            initial={{ scale: 0.8, opacity: 0, x: promo.decorationPosition === 'left' ? -20 : 20 }}
                                                            animate={{ scale: 1, opacity: 1, x: 0 }}
                                                            className={`absolute top-0 h-full w-1/2 pointer-events-none z-10 flex items-center justify-center ${promo.decorationPosition === 'left' ? 'left-0' : 'right-0'}`}
                                                        >
                                                            {isMediaVideo(promo.decorationImage) ? (
                                                                <video src={promo.decorationImage} autoPlay muted loop playsInline className="h-[80%] w-auto object-contain" />
                                                            ) : (
                                                                <img src={promo.decorationImage} alt="" className="h-[80%] w-auto object-contain drop-shadow-2xl" />
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </>
                                            )}

                                            <div className={`relative h-full px-8 flex flex-col justify-center text-white z-20 ${promo.decorationPosition === 'left' ? 'items-end text-right' : 'items-start text-left'}`}>
                                                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 block drop-shadow-md">Special Offer</span>
                                                    <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{promo.name}</h3>
                                                    <p className="text-xs font-bold opacity-90 line-clamp-1 italic drop-shadow-md">{promo.promoText}</p>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Active Promo Identifier */}
                    {activePromo && (
                        <div className="px-6 mt-6">
                            <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-theme/20" style={{ borderColor: `${config.themeColor}33` }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-theme/10 rounded-xl" style={{ backgroundColor: `${config.themeColor}11`, color: config.themeColor }}>
                                        <HiTag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">Active Filter</p>
                                        <h3 className="font-black text-gray-900 leading-none">{activePromo.name}</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPromoId(null)}
                                    className="p-2 rounded-xl bg-gray-900 text-white active:scale-95 transition-all"
                                >
                                    <HiArrowUturnLeft className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Floating Badge Promotions Button */}
                    {(() => {
                        const badgePromos = getPromosByDisplayStyle(config.promotions || [], 'badge');
                        if (badgePromos.length > 0 && !selectedPromoId) {
                            return (
                                <motion.button
                                    drag
                                    dragMomentum={false}
                                    dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: 0, bottom: window.innerHeight - 100 }}
                                    onClick={() => {
                                        if (badgePromos.length === 1) {
                                            setSelectedPromoId(badgePromos[0].id);
                                        } else {
                                            setShowBadgePromos(true);
                                        }
                                    }}
                                    className="fixed top-20 right-6 z-40 px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 text-white font-bold"
                                    style={{ backgroundColor: config.themeColor }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    <HiTag className="w-5 h-5" />
                                    <span className="text-sm">{badgePromos.length} {badgePromos.length === 1 ? 'Promo' : 'Promos'}</span>
                                </motion.button>
                            );
                        }
                        return null;
                    })()}
                    {/* Categories */}
                    <div className="px-6 mt-8 flex gap-6 overflow-x-auto no-scrollbar pb-2">
                        {categories.map((cat, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveCategory(cat)}
                                className={`whitespace-nowrap font-medium transition-colors ${activeCategory === cat ? 'text-theme scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                style={activeCategory === cat ? { color: config.themeColor } : {}}
                            >
                                {cat === 'All' ? t('auth.menu.all') : cat}
                            </button>
                        ))}
                    </div>

                    <div className="px-5 mt-6 pb-24">
                        <motion.div
                            className="grid grid-cols-2 gap-3"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            key={activeCategory}
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredMenuItems.length === 0 ? (
                                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                            <HiTag className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Sorry, nothing in promo here, soon</h3>
                                        <p className="text-sm text-gray-400 font-medium max-w-[200px] mx-auto opacity-70">There are no items matching this category and promotion combination.</p>
                                    </div>
                                ) : filteredMenuItems.map((item) => {
                                    const { finalPrice, discount, originalPrice, promo } = getDiscountedPrice(config.promotions || [], item);
                                    const hasDiscount = discount > 0;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                            onClick={() => handleItemClick(item)}
                                            className="bg-white rounded-[1.5rem] p-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center relative overflow-hidden group"
                                        >
                                            {hasDiscount && (
                                                <div
                                                    className="absolute top-0 left-0 px-3 py-1 rounded-br-2xl text-[10px] font-black text-white z-10 shadow-sm"
                                                    style={{ backgroundColor: config.themeColor }}
                                                >
                                                    {promo.discountType === 'percentage'
                                                        ? `${promo.discountValue}% OFF`
                                                        : `$${promo.discountValue} OFF`}
                                                </div>
                                            )}

                                            <button className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors z-10">
                                                <HiOutlineHeart className="w-5 h-5" />
                                            </button>

                                            <motion.div layoutId={`item-image-${item.id}`} className="w-28 h-28 rounded-full shadow-lg mt-1 mb-2 group-hover:scale-105 transition-transform duration-300">
                                                <img src={item.image} alt={localize(item, 'name')} className="w-full h-full object-cover rounded-full" />
                                            </motion.div>

                                            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 w-full truncate px-1">{localize(item, 'name')}</h3>

                                            <div className="w-full flex items-center justify-between mt-auto pl-1">
                                                <div className="flex flex-col items-start">
                                                    {hasDiscount && (
                                                        <span className="text-[10px] text-gray-400 line-through font-bold">
                                                            ${parseFloat(originalPrice).toFixed(2)}
                                                        </span>
                                                    )}
                                                    <span className="text-base font-black text-gray-900">
                                                        ${parseFloat(finalPrice).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Add Button - Bottom Right Corner */}
                                            <button
                                                className="absolute bottom-0 right-0 w-10 h-10 bg-theme flex items-center justify-center text-white rounded-tl-[1.2rem] hover:opacity-90 active:scale-95 transition-all"
                                                style={{
                                                    backgroundColor: config.themeColor,
                                                    boxShadow: `0 8px 20px -4px ${config.themeColor}aa`
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent opening modal
                                                    addToCart({ ...item, price: finalPrice, quantity: 1 });
                                                    triggerCartAnimation(item, e);
                                                }}
                                            >
                                                <HiPlus className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </motion.div >

            {/* --- SCROLL TO TOP BUTTON --- */}
            < AnimatePresence >
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white bg-theme hover:scale-110 active:scale-95 transition-all"
                        style={{ backgroundColor: config.themeColor }}
                    >
                        <HiArrowLeft className="w-6 h-6 rotate-90" />
                    </motion.button>
                )}
            </AnimatePresence >

            {/* Screen 2: Details View (Overlay) */}
            < AnimatePresence >
                {selectedItem && (
                    <motion.div
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.7}
                        style={{ backgroundColor: config.themeColor, y: dragY }}
                        onDragEnd={(_, info) => {
                            if (Math.abs(info.offset.y) > 150 || Math.abs(info.velocity.y) > 500) {
                                handleCloseDetail();
                            } else {
                                dragY.set(0);
                            }
                        }}
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 top-16 z-50 flex flex-col bg-theme overflow-hidden touch-none"
                    >
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all z-50 text-white"
                        >
                            {isLiked ? <HiHeart className="w-6 h-6" /> : <HiOutlineHeart className="w-6 h-6" />}
                        </button>

                        {/* Image Section */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')] pointer-events-none"></div>

                            <div className="relative">
                                <motion.div
                                    layoutId={`item-image-${selectedItem.id}`}
                                    className="w-64 h-64 rounded-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden z-10 relative"
                                >
                                    <img
                                        src={selectedItem.image}
                                        alt={localize(selectedItem, 'name')}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* Details Card */}
                        <motion.div
                            initial={{ y: 200 }}
                            animate={{ y: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 100, delay: 0.1 }}
                            className="bg-white rounded-t-[2.5rem] px-8 pt-10 pb-8 flex flex-col h-[55%] relative z-20"
                        >
                            <div className="w-12 h-1 bg-gray-200 rounded-full absolute top-4 left-1/2 -translate-x-1/2 mb-4"></div>

                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{localize(selectedItem, 'name')}</h2>
                                    {(() => {
                                        const { finalPrice, discount, originalPrice } = getDiscountedPrice(config.promotions || [], selectedItem);
                                        return (
                                            <div className="flex items-center gap-2">
                                                {discount > 0 && (
                                                    <span className="text-sm text-gray-400 line-through font-bold">
                                                        ${parseFloat(originalPrice).toFixed(2)}
                                                    </span>
                                                )}
                                                <span className="text-lg font-bold text-theme" style={{ color: config.themeColor }}>
                                                    ${parseFloat(finalPrice).toFixed(2)}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="flex items-center bg-theme rounded-full px-1 py-1" style={{ backgroundColor: config.themeColor }}>
                                    {quantity > 1 && (
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-white"><HiMinus /></button>
                                    )}
                                    <span className="w-6 text-center font-bold text-white">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-white"><HiPlus /></button>
                                </div>
                            </div>

                            {/* Metadata removed as per user request */}

                            <div className="flex-1 overflow-y-auto mb-6">
                                {(() => {
                                    const { promo } = getDiscountedPrice(config.promotions || [], selectedItem);
                                    if (promo) {
                                        return (
                                            <div className="bg-theme/10 rounded-2xl p-4 mb-4 border border-theme/20" style={{ borderColor: `${config.themeColor}33`, backgroundColor: `${config.themeColor}11` }}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <HiTag className="w-5 h-5 text-theme" style={{ color: config.themeColor }} />
                                                    <span className="text-theme font-black text-xs uppercase tracking-wider" style={{ color: config.themeColor }}>Active Promotion</span>
                                                </div>
                                                <p className="text-gray-700 font-bold text-sm">{promo.name}</p>
                                                <p className="text-gray-500 text-xs italic">{promo.promoText}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                <h3 className="font-bold text-gray-900 mb-2">{t('auth.menu.about')}</h3>
                                <div className="text-gray-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: localize(selectedItem, 'description') }} />
                            </div>

                            <button
                                onClick={(e) => {
                                    const { finalPrice } = getDiscountedPrice(config.promotions || [], selectedItem);
                                    addToCart({ ...selectedItem, price: finalPrice, quantity });
                                    triggerCartAnimation(selectedItem, e);
                                }}
                                className="w-full bg-theme text-white font-bold py-4 rounded-2xl shadow-xl hover:opacity-90 transition-opacity active:scale-95 text-lg"
                                style={{
                                    backgroundColor: config.themeColor,
                                    boxShadow: `0 20px 48px -12px ${config.themeColor}cc`
                                }}
                            >
                                {t('auth.menu.addToCart')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >

            <PublicMenuSidebar isOpen={showAuthSidebar} onClose={() => setShowAuthSidebar(false)} restaurantName={restaurantName} displayName={config.restaurantName} themeColor={config.themeColor} />
            <Checkout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                restaurantName={restaurantName}
                themeColor={config.themeColor}
                promotions={config.promotions || []}
                taxConfig={{ applyTax: config.applyTax, taxPercentage: config.taxPercentage }}
            />

            {/* Order Status Tracker */}
            {
                activeOrder && !isTopTrackerHidden && (
                    <PersistentOrderTracker
                        order={activeOrder}
                        onClose={handleCloseTracker}
                        themeColor={config.themeColor}
                    />
                )
            }

            {/* Floating Badge Promotions Modal */}
            <AnimatePresence>
                {showBadgePromos && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 sm:items-center sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBadgePromos(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl z-10"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Active Offers</h2>
                                    <button
                                        onClick={() => setShowBadgePromos(false)}
                                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500"
                                    >
                                        <HiXMark className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                                    {getPromosByDisplayStyle(config.promotions || [], 'badge').map((promo) => (
                                        <div
                                            key={promo.id}
                                            onClick={() => {
                                                setSelectedPromoId(promo.id);
                                                setShowBadgePromos(false);
                                            }}
                                            className="p-5 rounded-3xl border-2 flex flex-col gap-3 transition-all cursor-pointer hover:shadow-md active:scale-95"
                                            style={{ borderColor: `${config.themeColor}22`, backgroundColor: `${config.themeColor}08` }}
                                        >
                                            <div className="flex items-center gap-4">
                                                {promo.promoImage ? (
                                                    <img src={promo.promoImage} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm" style={{ backgroundColor: `${config.themeColor}22` }}>
                                                        🎁
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-black text-gray-900 dark:text-white">{promo.name}</h3>
                                                        <span className="text-theme font-black" style={{ color: config.themeColor }}>
                                                            {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 italic">{promo.promoText}</p>
                                                </div>
                                            </div>

                                            {promo.requiresCode && (
                                                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-dashed text-sm" style={{ borderColor: config.themeColor }}>
                                                    <span className="text-gray-500 font-bold">PROMO CODE:</span>
                                                    <span className="font-black tracking-widest text-theme uppercase" style={{ color: config.themeColor }}>{promo.promoCode}</span>
                                                </div>
                                            )}
                                            <div className="text-[10px] font-black text-theme uppercase tracking-widest text-center mt-2 border-t border-gray-100 pt-2" style={{ color: config.themeColor }}>
                                                Click to view items ➔
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowBadgePromos(false)}
                                    className="w-full mt-8 py-4 bg-theme text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all"
                                    style={{ backgroundColor: config.themeColor, boxShadow: `0 12px 24px -8px ${config.themeColor}88` }}
                                >
                                    Great!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Float to Cart Animation Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[100]">
                {animatingItems.map((anim) => (
                    <motion.div
                        key={anim.id}
                        initial={{
                            x: anim.startPos.x - 20,
                            y: anim.startPos.y - 20,
                            scale: 1,
                            opacity: 1
                        }}
                        animate={{
                            x: anim.targetPos.x,
                            y: anim.targetPos.y,
                            scale: 0.2,
                            opacity: 0,
                            rotate: 360
                        }}
                        transition={{
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        className="fixed w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg bg-white"
                        style={{ left: 0, top: 0 }}
                    >
                        <img src={anim.image} alt="" className="w-full h-full object-cover" />
                    </motion.div>
                ))}
            </div>
        </div >
    );
};

export default PublicMenuTestemplate;
