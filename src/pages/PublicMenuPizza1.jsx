import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiBars3, HiBuildingStorefront, HiXMark, HiTrash, HiOutlineClipboardDocumentList, HiUser, HiMagnifyingGlass } from 'react-icons/hi2';
import { FaInstagram, FaFacebookF, FaTiktok, FaGoogle } from 'react-icons/fa6';
import { FaSnapchatGhost } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import Checkout from '../components/menu/Checkout';
import { useClientAuth } from '../context/ClientAuthContext';
import PersistentOrderTracker from '../components/PersistentOrderTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { isPromoActive, getDiscountedPrice, getPromosByDisplayStyle, getPromoFilteredItems, calculateOrderDiscount } from '../utils/promoUtils';
import { HiTag, HiChevronLeft, HiChevronRight, HiArrowUturnLeft } from 'react-icons/hi2';

const PublicMenuPizza1 = ({ restaurantName: propRestaurantName }) => {
    const { user: clientUser, activeOrderId, activeOrder, handleCloseTracker, isTopTrackerHidden } = useClientAuth();
    const { t, localize } = useLanguage();
    const { restaurantName: urlRestaurantName } = useParams();
    const restaurantName = propRestaurantName || urlRestaurantName;
    const isMasterView = !restaurantName;

    const hardcodedMenuItems = [
        { id: 1, name: 'Sicilienne', description: 'Sauce tomate, fromage, poivron, oignons, olives, anchois', price: 11.90, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 2, name: 'Calzone', description: 'Sauce tomate, fromage, jambon, champignons, olives, œuf', price: 11.90, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 3, name: 'Pêcheur', description: 'Sauce tomate, fromage, thon, saumon, olives, oignon', price: 12.90, image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 4, name: '4 Fromages', description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort', price: 12.90, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 5, name: 'Mexicaine', description: 'Sauce tomate, fromage, bœuf haché, poivron, olives, oignon', price: 14.90, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 6, name: 'Chèvre', description: 'Crème fraîche, fromage, chèvre, olives, oignon', price: 13.90, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop', category: 'Premium' },
        { id: 7, name: 'Chicken', description: 'Crème fraîche, fromage, poulet fumé, champignons', price: 13.90, image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=1000&auto=format&fit=crop', category: 'Premium' },
        { id: 8, name: 'Bolognaise', description: 'Sauce chili BBQ, fromage, sauce bolognaise, pepperoni', price: 17.90, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop', category: 'Special' },
        { id: 9, name: 'Coca-Cola', description: '33cl can chilled', price: 2.50, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000&auto=format&fit=crop', category: 'Drinks' },
        { id: 10, name: 'Tiramisu', description: 'Homemade italian classic', price: 5.90, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000&auto=format&fit=crop', category: 'Desserts' },
    ];

    const [menuItems, setMenuItems] = useState(hardcodedMenuItems);
    const [config, setConfig] = useState({
        restaurantName: 'Pizza Time',
        themeColor: '#f97316',
        logoImage: null,
        useLogo: false,
        socialMedia: {}
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [liked, setLiked] = useState(false);
    const [showAuthSidebar, setShowAuthSidebar] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [showBadgePromos, setShowBadgePromos] = useState(false);
    const [selectedPromoId, setSelectedPromoId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        setIsCartOpen,
        getCartTotal
    } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (isMasterView) {
                    const response = await fetch('/.netlify/functions/templates?templateKey=pizza1');
                    const data = await response.json();
                    if (data && data.items) {
                        setMenuItems(data.items.map(item => ({ ...item, image: item.image_url })));
                        setConfig({
                            restaurantName: 'MASTER BLUEPRINT',
                            themeColor: data.config?.designConfig?.accentColor || data.config?.themeColor || '#f97316',
                            logoImage: null,
                            useLogo: false
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
                            socialMedia: data.menu.social_media || data.menu.config.socialMedia || {}
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
        const bannerPromos = getPromosByDisplayStyle(config.promotions || [], 'banner');
        if (bannerPromos.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % bannerPromos.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [config.promotions]);

    useEffect(() => {
        if (menuItems.length > 0 && !selectedItem) {
            setSelectedItem(menuItems[0]);
        }
    }, [menuItems]);

    useEffect(() => {
        const handleOpenAuth = () => setShowAuthSidebar(true);
        window.addEventListener('openClientAuth', handleOpenAuth);
        return () => window.removeEventListener('openClientAuth', handleOpenAuth);
    }, []);

    const handleCategorySelect = (category) => {
        setActiveCategory(category);
        const firstItem = menuItems.find(item => category === 'All' || item.category === category);
        if (firstItem) handleItemSelect(firstItem);
    };

    const handleAddToCart = () => {
        const { finalPrice } = getDiscountedPrice(config.promotions || [], selectedItem);
        addToCart({ ...selectedItem, price: finalPrice, quantity, size: 'Standard' });
        setQuantity(1);
    };

    const handleItemSelect = (item) => {
        if (!item || selectedItem?.id === item.id) return;
        setSelectedItem(item);
        setQuantity(1);
        setLiked(false);
    };

    const activePromo = selectedPromoId ? (config.promotions || []).find(p => p.id === selectedPromoId) : null;

    // Helper to detect video files
    const isMediaVideo = (url) => {
        if (!url) return false;
        return url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i);
    };

    const filteredMenuItems = menuItems.filter(item => {
        if (!item) return false;

        // Category filter
        const categoryMatch = activeCategory === 'All' || item.category === activeCategory;

        // Promotion filter
        let promoMatch = true;
        if (activePromo) {
            promoMatch = getPromoFilteredItems(activePromo, menuItems).some(promoItem => String(promoItem.id) === String(item.id));
        }

        // Search filter
        const nameMatch = localize(item, 'name').toLowerCase().includes(searchQuery.toLowerCase());

        return categoryMatch && promoMatch && nameMatch;
    });

    // Removed auto-item select on promo change as requested by user

    if (!selectedItem) return null;

    return (
        <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden relative" style={{ '--theme-color': config.themeColor }}>
            {activeOrder && !isTopTrackerHidden && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
                <PersistentOrderTracker order={activeOrder} onClose={handleCloseTracker} themeColor={config.themeColor} />
            )}
            <style>{`
                .text-theme { color: var(--theme-color) !important; }
                .bg-theme { background-color: var(--theme-color) !important; }
                .border-theme { border-color: var(--theme-color) !important; }
                .shadow-theme { box-shadow: 0 4px 14px 0 rgba(0,0,0,0.1); } 
                .hover-text-theme:hover { color: var(--theme-color) !important; }
                .hover-bg-theme:hover { background-color: var(--theme-color) !important; }
                .peer:checked ~ .peer-checked-text-theme { color: var(--theme-color); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Left Sidebar / Thumbnail List */}
            <div className="relative shrink-0 z-40 bg-white w-14 md:w-18 h-full flex flex-col items-center">
                <div className="flex-1 w-full overflow-y-auto scroll-smooth no-scrollbar py-6 flex flex-col items-center">
                    <button
                        onClick={() => setShowAuthSidebar(true)}
                        className="mb-6 p-4 rounded-[1.5rem] transition-all active:scale-95 flex items-center justify-center shrink-0"
                        style={{
                            color: config.themeColor,
                        }}
                    >
                        <HiBars3 className="w-6 h-6" />
                    </button>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        className="space-y-4 md:space-y-6 w-full px-2 flex flex-col items-center pb-20 pt-10 md:pt-16"
                    >
                        {activePromo && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setSelectedPromoId(null)}
                                className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg mb-4 active:scale-95 transition-all"
                                title="Back to All Menu"
                            >
                                <HiArrowUturnLeft className="w-6 h-6" />
                            </motion.button>
                        )}
                        {filteredMenuItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                <span className="text-4xl mb-4">😕</span>
                                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{t('auth.noOrders') || 'Sorry, nothing in promo here, soon'}</p>
                                <p className="text-[10px] text-gray-400 mt-2 opacity-60">Try selecting "All" or another category</p>
                            </div>
                        ) : filteredMenuItems.map((item) => (
                            <motion.button
                                key={item.id}
                                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleItemSelect(item)}
                                className="relative group w-full flex flex-col items-center justify-center transition-all duration-300"
                            >
                                <div
                                    className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-all duration-300 ${selectedItem?.id === item.id ? 'rounded-[1.5rem] md:rounded-[2rem] p-1' : 'rounded-full scale-90 opacity-80 hover:opacity-100'}`}
                                    style={selectedItem?.id === item.id ? { backgroundColor: '#FFEDE3', color: config.themeColor } : {}}
                                >
                                    <img
                                        src={item.image}
                                        alt={localize(item, 'name')}
                                        className="w-full h-full object-cover rounded-full shadow-sm"
                                    />
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>

                {/* Left Mini Footer Social Icons */}
                <div className="w-full p-4 flex flex-col items-center gap-4 mt-auto">
                    {[
                        { key: 'instagram', Icon: FaInstagram, label: 'Instagram' },
                        { key: 'facebook', Icon: FaFacebookF, label: 'Facebook' },
                        { key: 'tiktok', Icon: FaTiktok, label: 'TikTok' },
                        { key: 'snapchat', Icon: FaSnapchatGhost, label: 'Snapchat' },
                        { key: 'google', Icon: FaGoogle, label: 'Google Reviews' }
                    ].filter(social => {
                        // Show all if no config (backward compatibility)
                        if (!config.socialMedia || Object.keys(config.socialMedia).length === 0) return true;
                        return config.socialMedia[social.key]?.show;
                    }).map((social, idx) => (
                        <motion.a
                            key={idx}
                            href={config.socialMedia?.[social.key]?.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2, x: 4 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-400 hover:text-gray-900 transition-colors"
                            title={social.label}
                        >
                            <social.Icon size={16} />
                        </motion.a>
                    ))}
                </div>
            </div>

            {/* Main Content Area - Combined Header, Categories and Pizza Image */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar">
                <div className="px-5 pt-4 pb-1 shrink-0 z-20">
                    <div className="relative flex items-center justify-between min-h-[44px]">
                        {/* Absolute Centered Title/Logo */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center z-10 w-full px-12">
                            {config.useLogo && config.logoImage ? (
                                <img src={config.logoImage} alt={config.restaurantName} className="h-6 md:h-8 w-auto object-contain" />
                            ) : (
                                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter uppercase whitespace-nowrap text-center">{config.restaurantName}</h1>
                            )}
                        </div>

                        {/* Right Side Actions - Only Cart now */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-2 z-20">
                            <button onClick={() => setIsCartOpen(!isCartOpen)} className="p-1.5 text-gray-400 hover:text-gray-900 relative">
                                <HiShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                                {cartItems.length > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                            </button>
                        </div>
                    </div>


                </div>



                {/* Prominent Search Bar (80% width) over Categories */}
                <div className="px-5 mb-4 flex justify-center">
                    <div className="relative w-[80%] max-w-md">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <HiMagnifyingGlass className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('search.placeholder') || "Search items..."}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-opacity-50 transition-all"
                            style={{ outlineColor: config.themeColor }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                            >
                                <HiXMark className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {activePromo ? (
                    <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in px-4">
                        <span className="p-1 rounded-lg bg-red-50 text-red-500"><HiTag className="w-4 h-4" /></span>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Filtering: </span>
                        <span className="text-sm font-black text-gray-900 border-b-2 border-red-500">{activePromo.name}</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-4 md:gap-8 text-[12px] md:text-base mb-4 overflow-x-auto no-scrollbar py-1 w-full px-4">
                        {['All', ...new Set(menuItems.map(i => localize(i, 'category')).filter(Boolean))].map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategorySelect(category)}
                                className={`font-black pb-1.5 whitespace-nowrap transition-all relative ${activeCategory === category ? 'text-gray-900 scale-110' : 'text-gray-400 hover:text-gray-900'}`}
                            >
                                {category === 'All' ? t('auth.menu.all') : category.toUpperCase()}
                                {activeCategory === category && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 md:w-8 h-1 rounded-full"
                                        style={{ backgroundColor: config.themeColor }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Promotion Banner */}
                {config.promotions && getPromosByDisplayStyle(config.promotions, 'banner').length > 0 && !selectedPromoId && (
                    <div className="mx-[-20px] my-6 relative z-30 flex justify-center w-[calc(100%+40px)]">
                        <div className="relative w-full max-w-7xl h-28 md:h-48 lg:h-64 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 group border border-gray-100 bg-gray-900">
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

                                        <div className="relative h-full px-8 flex flex-col items-center justify-center z-20 gap-2 w-full text-center">
                                            {/* Text Content */}
                                            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                                                <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] opacity-80 mb-1 block drop-shadow-md" style={{ color: promo.textColor || '#ffffff' }}>Special Offer</span>
                                                <h3 className="text-xl md:text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight leading-none mb-2 drop-shadow-lg" style={{ color: promo.nameColor || '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{promo.name}</h3>
                                                <p className="text-xs md:text-lg font-bold opacity-90 line-clamp-1 italic drop-shadow-md" style={{ color: promo.textColor || '#ffffff' }}>{promo.promoText}</p>
                                            </motion.div>

                                            {/* Prominent Discount Badge */}
                                            {promo.showDiscountOnBanner !== false && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -20 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    className="flex items-baseline gap-2"
                                                >
                                                    <span className="text-2xl md:text-4xl font-black tracking-tighter" style={{ color: promo.discountColor || '#ffffff' }}>
                                                        {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                                                    </span>
                                                    <span className="text-[10px] md:text-sm font-black uppercase tracking-widest opacity-60" style={{ color: promo.discountColor || '#ffffff' }}>OFF</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Hero Image & Animation Container - Shifted even further up and circular animation */}
                <div className="flex-1 flex items-center justify-start p-0 relative min-h-[400px] pointer-events-none mt-[-80px] md:mt-[-120px] overflow-visible">
                    <div className="w-[110vw] h-[110vw] max-w-[650px] max-h-[650px] relative z-10 aspect-square shrink-0 translate-x-[10%] md:translate-x-[15%] -translate-y-[20%] md:-translate-y-[25%]">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={selectedItem.id}
                                initial={{ scale: 0.5, rotate: 180, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                exit={{ scale: 0.5, rotate: -180, opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20,
                                    mass: 0.8
                                }}
                                className="absolute inset-0 w-full h-full rounded-full border-none z-10"
                            >
                                <motion.img
                                    whileHover={{ scale: 1.02 }}
                                    src={selectedItem.image}
                                    alt={localize(selectedItem, 'name')}
                                    className="w-full h-full object-cover drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-full"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            {/* Details Card - Animation removed as requested */}
            <div
                className="fixed bottom-0 left-0 right-0 z-[60] bg-white pb-12"
            >
                <div className="px-8 py-4 max-w-lg">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-5xl font-black text-gray-900 leading-[1.1] mb-1 md:mb-2 uppercase tracking-tight">
                                {localize(selectedItem, 'name')}
                            </h2>
                            <div className="flex items-center gap-2 text-gray-400">
                                <HiBars3 className="w-4 h-3 md:w-5 md:h-4 opacity-100" />
                                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">ingredients</span>
                            </div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => setLiked(!liked)}
                            className="text-gray-300 hover:text-red-500 transition-colors pt-2"
                        >
                            {liked ? <HiHeart className="w-7 h-7 text-red-500" /> : <HiOutlineHeart className="w-7 h-7" />}
                        </motion.button>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8 mt-4 md:mt-8">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl md:text-2xl font-black" style={{ color: config.themeColor }}>$</span>
                            {(() => {
                                const { finalPrice } = getDiscountedPrice(config.promotions || [], selectedItem);
                                return (
                                    <span className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                        {parseFloat(finalPrice).toFixed(2)}
                                    </span>
                                );
                            })()}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddToCart}
                            className="h-12 md:h-14 px-6 md:px-8 rounded-full border-2 transition-all flex items-center gap-3 md:gap-4 bg-white hover:shadow-lg"
                            style={{ borderColor: config.themeColor, color: config.themeColor }}
                        >
                            <span className="font-black text-sm md:text-base uppercase tracking-wider">Add to</span>
                            <div className="p-1 rounded-md">
                                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                            </div>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full bg-white">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900">{t('menu.cart')}</h2>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"><HiXMark className="w-6 h-6" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                        {cartItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <HiShoppingBag className="w-16 h-16 mb-4 opacity-10" />
                                <p className="font-medium text-gray-400">{t('auth.noOrders')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex gap-3 bg-white border border-gray-50 rounded-2xl p-3 shadow-sm">
                                        <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-xl overflow-hidden"><img src={item.image} alt={localize(item, 'name')} className="w-full h-full object-cover" /></div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-bold text-gray-900 text-sm truncate">{localize(item, 'name')}</h3>
                                                <button onClick={() => removeFromCart(item.id, item.size)} className="text-gray-300 hover:text-red-500 transition-colors"><HiTrash className="w-4 h-4" /></button>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="font-bold text-theme text-sm" style={{ color: config.themeColor }}>${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</span>
                                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                                                    {item.quantity > 1 && (
                                                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="text-gray-400 hover:text-gray-900"><HiMinus className="w-3 h-3" /></button>
                                                    )}
                                                    <span className="text-xs font-bold text-gray-900 w-3 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="text-gray-400 hover:text-gray-900"><HiPlus className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        {(() => {
                            const subtotal = getCartTotal();
                            const { discount: orderDiscount, promo: orderPromo } = calculateOrderDiscount(config.promotions || [], subtotal);
                            const total = subtotal - orderDiscount;
                            return (
                                <>
                                    <div className="flex justify-between mb-2 text-sm text-gray-500 italic">
                                        <span>{t('auth.checkout.subtotal')}</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    {orderDiscount > 0 && (
                                        <div className="flex justify-between mb-2 text-sm text-orange-600 dark:text-orange-500 font-black uppercase tracking-tight">
                                            <div className="flex flex-col">
                                                <span>{orderPromo?.name || 'Promo Discount'}</span>
                                                <span className="text-[9px] opacity-60">Order-level offer applied</span>
                                            </div>
                                            <span>-${orderDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {config.applyTax && (
                                        <div className="flex justify-between mb-2 text-sm text-gray-500 italic">
                                            <span>{t('auth.checkout.taxes')} ({config.taxPercentage}%)</span>
                                            <span>${(Math.max(0, subtotal - orderDiscount) * (config.taxPercentage / 100)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between mb-6">
                                        <span className="text-gray-900 font-bold text-lg">{t('auth.checkout.total')}</span>
                                        <span className="font-black text-2xl text-gray-900" style={{ color: (subtotal - orderDiscount + (Math.max(0, subtotal - orderDiscount) * (config.applyTax ? config.taxPercentage / 100 : 0))) < subtotal ? config.themeColor : '#111827' }}>
                                            ${(Math.max(0, subtotal - orderDiscount) + (Math.max(0, subtotal - orderDiscount) * (config.applyTax ? config.taxPercentage / 100 : 0))).toFixed(2)}
                                        </span>
                                    </div>
                                </>
                            );
                        })()}
                        <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all active:scale-95">{t('auth.checkout.title')}</button>
                    </div>
                </div>
            </div>

            <PublicMenuSidebar
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName={restaurantName}
                displayName={config.restaurantName}
                themeColor={config.themeColor}
                socialMedia={config.socialMedia}
            />
            <Checkout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                restaurantName={restaurantName}
                themeColor={config.themeColor}
                promotions={config.promotions || []}
                taxConfig={{ applyTax: config.applyTax, taxPercentage: config.taxPercentage }}
            />

            {/* Top Fixed Floating Badge */}
            {
                getPromosByDisplayStyle(config.promotions || [], 'badge').length > 0 && !selectedPromoId && (
                    <div className="fixed top-20 right-6 z-[80]">
                        <motion.button
                            drag
                            dragMomentum={false}
                            dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: 0, bottom: window.innerHeight - 100 }}
                            initial={{ x: 100, opacity: 0, rotate: -10 }}
                            animate={{ x: 0, opacity: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                const badgePromos = getPromosByDisplayStyle(config.promotions || [], 'badge');
                                if (badgePromos.length === 1) {
                                    setSelectedPromoId(badgePromos[0].id);
                                    if (window.innerWidth < 768) setIsCartOpen(false); // Close cart if open on mobile
                                } else {
                                    setShowBadgePromos(true);
                                }
                            }}
                            className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-2xl flex items-center justify-center border-2 border-theme relative group"
                            style={{ borderColor: config.themeColor }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <HiTag className="w-6 h-6 md:w-7 md:h-7 text-theme" style={{ color: config.themeColor }} />
                            </motion.div>
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {getPromosByDisplayStyle(config.promotions || [], 'badge').length}
                            </span>

                            {/* Tooltip */}
                            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
                                Offers Active!
                            </div>
                        </motion.button>
                    </div>
                )
            }

            {/* Badge Promotions List Modal */}
            <AnimatePresence>
                {showBadgePromos && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBadgePromos(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white dark:bg-[#1a1c23] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Active Offers</h2>
                                    <button onClick={() => setShowBadgePromos(false)} className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 transition-colors">
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
                                            className="p-5 rounded-3xl bg-orange-50 border border-orange-100 flex flex-col gap-3 cursor-pointer hover:border-orange-300 transition-all active:scale-95"
                                        >
                                            <div className="flex items-center gap-4">
                                                {promo.promoImage ? (
                                                    <img src={promo.promoImage} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-2xl bg-orange-200 flex items-center justify-center text-2xl shadow-sm">🎁</div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-black text-gray-900">{promo.name}</h3>
                                                        <span className="text-orange-600 font-black">{promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 italic">{promo.promoText}</p>
                                                </div>
                                            </div>
                                            {promo.requiresCode && (
                                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-dashed border-orange-300 text-sm">
                                                    <span className="text-gray-400 font-bold">PROMO CODE</span>
                                                    <span className="font-black tracking-widest text-orange-600 uppercase">{promo.promoCode}</span>
                                                </div>
                                            )}
                                            <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest text-center mt-2 border-t border-orange-100 pt-2">
                                                Click to view items ➔
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={() => setShowBadgePromos(false)} className="w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm">Got it!</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default PublicMenuPizza1;
