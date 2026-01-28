import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiBars3, HiBuildingStorefront, HiXMark, HiTrash, HiOutlineClipboardDocumentList, HiUser } from 'react-icons/hi2';
import { FaInstagram, FaFacebookF, FaTiktok, FaGoogle } from 'react-icons/fa6';
import { FaSnapchatGhost } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import Checkout from '../components/menu/Checkout';
import WelcomeSequence from '../components/public-menu/WelcomeSequence';
import { useClientAuth } from '../context/ClientAuthContext';
import PersistentOrderTracker from '../components/PersistentOrderTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { isPromoActive, getDiscountedPrice, getPromosByDisplayStyle } from '../utils/promoUtils';
import { HiTag, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

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
        useLogo: false
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
                            restaurantName: data.menu.config.restaurantName || data.restaurant || restaurantName
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
        addToCart({ ...selectedItem, quantity, size: 'Standard' });
        setQuantity(1);
    };

    const handleItemSelect = (item) => {
        if (!item || selectedItem?.id === item.id) return;
        setSelectedItem(item);
        setQuantity(1);
        setLiked(false);
    };

    if (!selectedItem) {
        if (isLoading) return <div className="min-h-screen flex items-center justify-center text-green-500">{t('auth.menu.loading')}</div>;
    }

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
            <div className="relative shrink-0 z-40 bg-white/90 backdrop-blur-md md:bg-white/50 w-24 md:w-32 lg:w-40 h-full flex flex-col items-center border-r border-gray-100/50">
                <div className="flex-1 w-full overflow-y-auto scroll-smooth no-scrollbar py-6 flex flex-col items-center">
                    <button
                        onClick={() => setShowAuthSidebar(true)}
                        className="mb-6 p-4 rounded-[1.5rem] border shadow-sm transition-all active:scale-95 flex items-center justify-center shrink-0"
                        style={{
                            color: config.themeColor,
                            borderColor: `${config.themeColor}40`,
                            backgroundColor: `${config.themeColor}08`,
                            boxShadow: `0 4px 6px -1px ${config.themeColor}20`
                        }}
                    >
                        <HiBars3 className="w-6 h-6" />
                    </button>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        className="space-y-6 w-full px-3 flex flex-col items-center pb-20"
                    >
                        {menuItems.filter(item => item && (activeCategory === 'All' || item.category === activeCategory)).map((item) => (
                            <motion.button
                                key={item.id}
                                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleItemSelect(item)}
                                className="relative group w-full flex flex-col items-center justify-center transition-all duration-300"
                            >
                                <div
                                    className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-300 ${selectedItem.id === item.id ? 'rounded-[1.8rem] p-1.5' : 'rounded-full p-0 scale-90 opacity-70 hover:opacity-100 hover:scale-100'}`}
                                    style={selectedItem.id === item.id ? { backgroundColor: `${config.themeColor}20`, color: config.themeColor } : {}}
                                >
                                    <img
                                        src={item.image}
                                        alt={localize(item, 'name')}
                                        className="w-full h-full object-cover rounded-full shadow-md"
                                        style={selectedItem.id === item.id ? { boxShadow: `0 4px 14px 0 ${config.themeColor}40` } : {}}
                                    />
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>

                {/* Left Mini Footer Social Icons */}
                <div className="w-full p-4 flex flex-col items-center gap-4 bg-white/50 backdrop-blur-md border-t border-gray-100/50">
                    {[
                        { Icon: FaInstagram, label: 'Instagram' },
                        { Icon: FaFacebookF, label: 'Facebook' },
                        { Icon: FaTiktok, label: 'TikTok' },
                        { Icon: FaSnapchatGhost, label: 'Snapchat' },
                        { Icon: FaGoogle, label: 'Google Reviews' }
                    ].map((social, idx) => (
                        <motion.a
                            key={idx}
                            href="#"
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-0 pb-48">
                <div className="px-5 pt-4 pb-1 shrink-0 z-20">
                    <div className="flex justify-between items-center mb-6">
                        <div className="md:hidden"></div>
                        {config.useLogo && config.logoImage ? (
                            <img src={config.logoImage} alt={config.restaurantName} className="h-12 md:h-16 w-auto object-contain mx-auto" />
                        ) : (
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 mx-auto tracking-tight uppercase">{config.restaurantName}</h1>
                        )}
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsCartOpen(!isCartOpen)} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors relative">
                                <HiShoppingBag className="w-6 h-6" />
                                {cartItems.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-start gap-4 md:gap-8 text-sm md:text-base mb-2 overflow-x-auto no-scrollbar py-1">
                        {['All', ...new Set(menuItems.map(i => localize(i, 'category')).filter(Boolean))].map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategorySelect(category)}
                                className={`font-bold pb-1 whitespace-nowrap transition-colors ${activeCategory === category ? 'text-gray-900 border-b-2' : 'text-gray-400 hover-text-theme'}`}
                                style={activeCategory === category ? { borderColor: config.themeColor } : {}}
                            >
                                {category === 'All' ? t('auth.menu.all') : category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hero Image & Animation Container */}
                <div className="flex-1 flex items-center justify-center p-2 relative min-h-[220px]">
                    <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-orange-50/50 rounded-full blur-[80px] -z-10 pointer-events-none" />

                    <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-96 md:h-96 relative z-10 aspect-square shrink-0">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={selectedItem.id}
                                initial={{ rotate: 90, opacity: 0, scale: 0.8, x: 200 }}
                                animate={{ rotate: 0, opacity: 1, scale: 1, x: 0 }}
                                exit={{ rotate: -90, opacity: 0, scale: 0.8, x: -200 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="absolute inset-0 w-full h-full rounded-full overflow-hidden border-none shadow-none z-10"
                                style={{ transformOrigin: 'center center' }}
                            >
                                <motion.img whileHover={{ scale: 1.05, rotate: 5 }} src={selectedItem.image} alt={localize(selectedItem, 'name')} className="w-full h-full object-cover shadow-2xl rounded-full" />
                                <div className="absolute inset-0 flex justify-center pointer-events-none">
                                    <div className="flex gap-4 opacity-30 mt-4">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div key={i} animate={{ y: [-10, -40], opacity: [0, 1, 0], scale: [1, 1.5] }} transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.4 }} className="w-2 h-12 bg-gradient-to-t from-gray-200 to-transparent blur-md rounded-full" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Details Card */}
            <motion.div
                key={`details-${selectedItem.id}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-[60] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-50"
            >
                <div className="px-5 py-3 flex justify-between items-start mb-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <h2 className="text-lg md:text-2xl font-black text-gray-900 mb-0.5 truncate h-7 flex items-center">{localize(selectedItem, 'name')}</h2>
                        <div className="flex items-start gap-2 mb-0 h-10 overflow-hidden">
                            <p className="text-gray-500 text-xs leading-tight max-w-xs line-clamp-2">{localize(selectedItem, 'description')}</p>
                        </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.8 }} onClick={() => setLiked(!liked)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 pt-1">
                        {liked ? <HiHeart className="w-6 h-6 text-red-500" /> : <HiOutlineHeart className="w-6 h-6" />}
                    </motion.button>
                </div>

                <div className="px-5 pb-4 flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-theme font-mono">$</span>
                        <motion.span key={selectedItem.price} initial={{ scale: 1.2, color: config.themeColor }} animate={{ scale: 1, color: "#111827" }} className="text-2xl font-black text-gray-900">
                            {parseFloat(selectedItem.price || 0).toFixed(2)}
                        </motion.span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1.5 h-10">
                            {quantity > 1 && (
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-5 h-5 flex items-center justify-center text-gray-400 hover-text-theme transition-colors active:scale-95"><HiMinus className="w-4 h-4" /></button>
                            )}
                            <AnimatePresence mode="wait">
                                <motion.span key={quantity} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -5, opacity: 0 }} className="w-4 text-center font-bold text-gray-900 text-sm">{quantity}</motion.span>
                            </AnimatePresence>
                            <button onClick={() => setQuantity(q => q + 1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover-text-theme transition-colors active:scale-95"><HiPlus className="w-4 h-4" /></button>
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart} className="bg-white border transition-colors hover:border-theme border-gray-200 text-theme hover-text-theme rounded-[1.2rem] py-2.5 px-6 font-bold text-sm shadow-sm flex items-center justify-center gap-2 h-10" style={{ color: config.themeColor, borderColor: `${config.themeColor}40` }}>
                            <span>{t('menu.addToCart')}</span><HiShoppingBag className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>

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
                        <div className="flex justify-between mb-2 text-sm text-gray-500"><span>{t('auth.checkout.subtotal')}</span><span>${parseFloat(getCartTotal() || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between mb-6"><span className="text-gray-900 font-bold text-lg">{t('auth.checkout.total')}</span><span className="font-black text-2xl text-gray-900">${parseFloat(getCartTotal() || 0).toFixed(2)}</span></div>
                        <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg">{t('auth.checkout.title')}</button>
                    </div>
                </div>
            </div>

            <PublicMenuSidebar isOpen={showAuthSidebar} onClose={() => setShowAuthSidebar(false)} restaurantName={restaurantName} displayName={config.restaurantName} themeColor={config.themeColor} />
            <Checkout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                restaurantName={restaurantName}
                themeColor={config.themeColor}
                promotions={config.promotions || []}
                taxConfig={{ applyTax: config.applyTax, taxPercentage: config.taxPercentage }}
            />

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
                                        <div key={promo.id} className="p-5 rounded-3xl bg-orange-50 border border-orange-100 flex flex-col gap-3">
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
                                        </div>
                                    ))}
                                </div>

                                <button onClick={() => setShowBadgePromos(false)} className="w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm">Got it!</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <WelcomeSequence restaurantName={config.restaurantName} themeColor={config.themeColor} promoConfig={config} />
        </div >
    );
};

export default PublicMenuPizza1;
