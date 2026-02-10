import React, { useState, useEffect } from 'react';
import { HiShoppingBag, HiMinus, HiPlus, HiBars3, HiXMark, HiTrash, HiMagnifyingGlass, HiHeart, HiSparkles, HiArrowUp } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PublicMenuSidebarFun from '../components/public-menu/PublicMenuSidebarFun';
import CheckoutFun from '../components/menu/CheckoutFun';
import { useClientAuth } from '../context/ClientAuthContext';
import PersistentOrderTracker from '../components/PersistentOrderTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { getDiscountedPrice, getPromosByDisplayStyle, calculateOrderDiscount, calculateLoyaltyDiscount } from '../utils/promoUtils';
import { HiTag } from 'react-icons/hi2';
import { useLoyalty } from '../context/LoyaltyContext';
import LoyaltyRewardUI from '../components/loyalty/LoyaltyRewardUI';
import LoyaltyProgressBar from '../components/loyalty/LoyaltyProgressBar';
import { getLoyaltyMessage, LOYALTY_MESSAGE_KEYS } from '../translations/loyaltyMessages';

const PublicMenuPizzaFun = ({ restaurantName: propRestaurantName }) => {
    const { user: clientUser, activeOrderId, activeOrder, handleCloseTracker, isTopTrackerHidden } = useClientAuth();
    const { t, localize, language } = useLanguage();
    const { restaurantName: urlRestaurantName } = useParams();
    const restaurantName = propRestaurantName || urlRestaurantName;
    const isMasterView = !restaurantName;

    const hardcodedMenuItems = [
        // Existing Items (Updated with Local Images)
        { id: 1, name: 'Sicilienne', description: 'Sauce tomate, fromage, poivron, oignons, olives, anchois', price: 11.90, image: '/pizzas/sicilienne.png', category: 'Classic' },
        { id: 2, name: 'Calzone', description: 'Sauce tomate, fromage, jambon, champignons, olives, œuf', price: 11.90, image: '/pizzas/calzone.png', category: 'Classic' },
        { id: 3, name: 'Pêcheur', description: 'Sauce tomate, fromage, thon, saumon, olives, oignon', price: 12.90, image: '/pizzas/pecheur.png', category: 'Classic' },
        { id: 4, name: '4 Fromages', description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort', price: 12.90, image: '/pizzas/4fromages.png', category: 'Classic' },
        { id: 5, name: 'Mexicaine', description: 'Sauce tomate, fromage, bœuf haché, poivron, olives, oignon', price: 14.90, image: '/pizzas/mexicaine.png', category: 'Classic' },
        { id: 6, name: 'Chèvre', description: 'Crème fraîche, fromage, chèvre, olives, oignon', price: 13.90, image: '/pizzas/chevre.png', category: 'Premium' },
        { id: 7, name: 'Chicken', description: 'Crème fraîche, fromage, poulet fumé, champignons', price: 13.90, image: '/pizzas/4fromages.png', category: 'Premium' }, // Placeholder image
        { id: 8, name: 'Bolognaise', description: 'Sauce chili BBQ, fromage, sauce bolognaise, pepperoni', price: 17.90, image: '/pizzas/mexicaine.png', category: 'Special' }, // Placeholder image

        // New Items from Request
        { id: 11, name: 'Marinara DOP', description: 'Blended San Marzano tomatoes, piennolo tomato, oregano, garlic', price: 9.90, image: '/pizzas/sicilienne.png', category: 'Classic' },
        { id: 12, name: 'Margherita', description: 'Blended San Marzano tomatoes, fior di latte, basil, pecorino gran cru', price: 10.90, image: '/pizzas/chevre.png', category: 'Classic' },
        { id: 13, name: 'Bufalaina', description: 'Blended San Marzano tomatoes, mozzarella di bufala, basil, pecorino gran cru', price: 13.90, image: '/pizzas/4fromages.png', category: 'Premium' },
        { id: 14, name: 'Funghi', description: 'Blended San Marzano tomatoes, fior di latte, mushrooms, basil, pecorino', price: 11.90, image: '/pizzas/calzone.png', category: 'Classic' },
        { id: 15, name: 'Puttanesca', description: 'Blended San Marzano tomatoes, fior di latte, anchovies, black olives, capers, tomatoes, parmigiano reggiano', price: 12.90, image: '/pizzas/sicilienne.png', category: 'Special' },
        { id: 16, name: 'Salsiccia', description: 'Blended San Marzano tomatoes, fior di latte, sausage, basil, pecorino gran cru', price: 13.90, image: '/pizzas/mexicaine.png', category: 'Premium' },
        { id: 17, name: 'Funghi e Salsiccia', description: 'Blended San Marzano tomatoes, fior di latte, mushrooms, sausage, basil, pecorino gran cru', price: 14.90, image: '/pizzas/calzone.png', category: 'Premium' },
        { id: 18, name: 'Capricciosa', description: 'Blended San Marzano tomatoes, fior di latte, prosciutto cotto, mushrooms, black olives, artichokes', price: 14.90, image: '/pizzas/pecheur.png', category: 'Special' },
        { id: 19, name: 'Diavola', description: 'Blended San Marzano tomatoes, fior di latte, Calabrese soppressata, basil', price: 13.90, image: '/pizzas/mexicaine.png', category: 'Classic' },

        // Drinks & Desserts
        { id: 9, name: 'Coca-Cola', description: '33cl can chilled', price: 2.50, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000&auto=format&fit=crop', category: 'Drinks' },
        { id: 10, name: 'Tiramisu', description: 'Homemade italian classic', price: 5.90, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000&auto=format&fit=crop', category: 'Desserts' },
    ];

    const [menuItems, setMenuItems] = useState(hardcodedMenuItems);
    const [config, setConfig] = useState({
        restaurantName: 'Pizza Party',
        themeColor: '#ff6b35',
        logoImage: null,
        useLogo: false,
        socialMedia: {}
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showAuthSidebar, setShowAuthSidebar] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [cartBounce, setCartBounce] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [modalQuantity, setModalQuantity] = useState(1);

    const { trackVisit, getStatus, markWelcomeAsShown } = useLoyalty();
    const loyaltyInfo = getStatus(restaurantName);
    const teaser = calculateLoyaltyDiscount(loyaltyInfo, 0, loyaltyInfo.config || {});

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
                    const response = await fetch('/.netlify/functions/templates?templateKey=pizzaFun');
                    const data = await response.json();
                    if (data && data.items && data.items.length > 0) {
                        setMenuItems(data.items.map(item => ({ ...item, image: item.image_url })));
                    } else {
                        // Fallback to hardcoded items if no items in DB (for preview)
                        setMenuItems(hardcodedMenuItems);
                    }
                    setConfig({
                        restaurantName: 'MASTER BLUEPRINT',
                        themeColor: data.config?.designConfig?.accentColor || data.config?.themeColor || '#ff6b35',
                        logoImage: null,
                        useLogo: false
                    });
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
        const handleOpenAuth = () => setShowAuthSidebar(true);
        window.addEventListener('openClientAuth', handleOpenAuth);
        return () => window.removeEventListener('openClientAuth', handleOpenAuth);
    }, []);

    useEffect(() => {
        if (restaurantName) {
            trackVisit(restaurantName);
        }
    }, [restaurantName]);

    const handleCategorySelect = (category) => {
        setActiveCategory(category);
    };

    const getCartItemQuantity = (itemId) => {
        // Assume 'Standard' size for grid items as per handleAddToCart
        const item = cartItems.find(i => i.id === itemId && i.size === 'Standard');
        return item ? item.quantity : 0;
    };

    const handleUpdateQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId, 'Standard');
        } else {
            updateQuantity(itemId, 'Standard', newQuantity);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleAddToCart = (item, quantity = 1) => {
        const { finalPrice } = getDiscountedPrice(config.promotions || [], item);
        addToCart({ ...item, price: finalPrice, quantity: quantity, size: 'Standard' });

        // Trigger confetti and cart bounce
        setShowConfetti(true);
        setCartBounce(true);
        setTimeout(() => setShowConfetti(false), 2000);
        setTimeout(() => setCartBounce(false), 600);
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setModalQuantity(1);
    };

    const categoryEmojis = {
        'Classic': '🍕',
        'Premium': '⭐',
        'Special': '🔥',
        'Drinks': '🥤',
        'Desserts': '🍰',
        'All': '🎉'
    };

    const filteredMenuItems = menuItems.filter(item => {
        if (!item) return false;
        const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
        const nameMatch = localize(item, 'name').toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && nameMatch;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-6xl"
                >
                    🍕
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 relative overflow-x-hidden" style={{ '--theme-color': config.themeColor }}>
            {activeOrder && !isTopTrackerHidden && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
                <PersistentOrderTracker order={activeOrder} onClose={handleCloseTracker} themeColor={config.themeColor} />
            )}

            <style>{`
                .text-theme { color: var(--theme-color) !important; }
                .bg-theme { background-color: var(--theme-color) !important; }
                .border-theme { border-color: var(--theme-color) !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(3deg); }
                    75% { transform: rotate(-3deg); }
                }
                
                .wiggle:hover {
                    animation: wiggle 0.3s ease-in-out;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                .float-animation {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>

            {/* Confetti Effect */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    y: -20,
                                    x: Math.random() * window.innerWidth,
                                    opacity: 1,
                                    rotate: 0
                                }}
                                animate={{
                                    y: window.innerHeight + 100,
                                    rotate: Math.random() * 720,
                                    opacity: 0
                                }}
                                transition={{
                                    duration: 2 + Math.random(),
                                    ease: "easeIn"
                                }}
                                className="absolute text-2xl"
                            >
                                {['🍕', '🎉', '⭐', '🎊', '💫'][Math.floor(Math.random() * 5)]}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-lg border-b-4 border-orange-200"
            >
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Menu Button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAuthSidebar(true)}
                            className="p-3 bg-gradient-to-br from-orange-400 to-pink-400 text-white rounded-2xl shadow-lg"
                        >
                            <HiBars3 className="w-6 h-6" />
                        </motion.button>

                        {/* Restaurant Name/Logo */}
                        <motion.div
                            className="flex-1 text-center"
                            animate={{ rotate: [0, 2, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            {config.useLogo && config.logoImage ? (
                                <img src={config.logoImage} alt={config.restaurantName} className="h-12 w-auto mx-auto" />
                            ) : (
                                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                                    {config.restaurantName} 🍕
                                </h1>
                            )}
                        </motion.div>

                        {/* Cart Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            animate={cartBounce ? { scale: [1, 1.3, 0.9, 1.1, 1] } : {}}
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            className="p-3 bg-gradient-to-br from-yellow-400 to-orange-400 text-white rounded-2xl shadow-lg relative"
                        >
                            <HiShoppingBag className="w-6 h-6" />
                            {cartItems.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white"
                                >
                                    {cartItems.length}
                                </motion.span>
                            )}
                        </motion.button>
                    </div>

                    {/* Loyalty Points Badge */}
                    {loyaltyInfo.config?.points_system_enabled !== false && loyaltyInfo.totalPoints > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-3 flex justify-center"
                        >
                            <div className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full shadow-lg flex items-center gap-2">
                                <HiSparkles className="w-5 h-5" />
                                <span className="font-black text-sm">
                                    {getLoyaltyMessage(LOYALTY_MESSAGE_KEYS.POINTS_BADGE, language, { points: loyaltyInfo.totalPoints })}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 pt-32 md:pt-40">
                {/* Search Bar */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6"
                >
                    <div className="relative max-w-2xl mx-auto">
                        <HiMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('search.placeholder') || "🔍 What pizza are you craving?"}
                            className="w-full bg-white border-4 border-orange-200 rounded-3xl pl-14 pr-6 py-4 text-lg font-bold text-gray-900 placeholder:text-gray-400 shadow-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        />
                    </div>
                </motion.div>

                {/* Loyalty Progress - Show for all users (Teaser or Status) */}
                {loyaltyInfo && (
                    <div className="mb-6">
                        <LoyaltyProgressBar
                            loyaltyConfig={loyaltyInfo?.config || {}}
                            isDarkMode={false}
                            percentage={teaser.progressPercentage || 0}
                            progressMessage={teaser.messageKey ? getLoyaltyMessage(teaser.messageKey, language, teaser.messageVariables) : null}
                        />
                    </div>
                )}

                {/* Categories */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8 flex gap-3 overflow-x-auto no-scrollbar pb-2"
                >
                    {['All', ...new Set(menuItems.map(i => localize(i, 'category')).filter(Boolean))].map((category) => (
                        <motion.button
                            key={category}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategorySelect(category)}
                            className={`px-6 py-3 rounded-2xl font-black text-sm whitespace-nowrap shadow-lg transition-all ${activeCategory === category
                                ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white scale-105'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className="mr-2">{categoryEmojis[category] || '🍴'}</span>
                            {category === 'All' ? t('auth.menu.all') : category}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                    <AnimatePresence>
                        {filteredMenuItems.map((item, index) => {
                            const quantity = getCartItemQuantity(item.id);
                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05, rotate: 2, y: -10 }}
                                    onClick={() => handleItemClick(item)}
                                    className="bg-white rounded-3xl shadow-xl overflow-visible cursor-pointer transition-all wiggle pt-4 flex flex-col h-full"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-square overflow-visible flex items-center justify-center p-4 md:p-8">
                                        <motion.div
                                            className="relative w-full h-full rounded-full shadow-2xl overflow-hidden"
                                            whileHover={{ scale: 1.1, rotate: 360 }}
                                            transition={{ duration: 0.8 }}
                                        >
                                            <img
                                                src={item.image}
                                                alt={localize(item, 'name')}
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>

                                        {/* Heart Icon */}
                                        <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="absolute top-0 right-0 p-2 bg-white/90 rounded-full shadow-lg z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <HiHeart className="w-5 h-5 text-pink-400" />
                                        </motion.button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2 line-clamp-1">
                                            {localize(item, 'name')}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                                            {localize(item, 'description')}
                                        </p>

                                        {/* Price and Controls */}
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                                                    ${parseFloat(getDiscountedPrice(config.promotions || [], item).finalPrice).toFixed(2)}
                                                </span>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(item);
                                                }}
                                                className="p-2 md:p-3 bg-gradient-to-br from-orange-400 to-pink-400 text-white rounded-xl shadow-lg"
                                            >
                                                <HiPlus className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredMenuItems.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-8xl mb-4 float-animation"
                        >
                            😢
                        </motion.div>
                        <h3 className="text-2xl font-black text-gray-600 mb-2">No pizzas found!</h3>
                        <p className="text-gray-500">Try a different search or category</p>
                    </motion.div>
                )}
            </div>

            {/* Item Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50, rotate: -5 }}
                            animate={{ scale: 1, y: 0, rotate: 0 }}
                            exit={{ scale: 0.8, y: 50, rotate: 5 }}
                            className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Image */}
                            <div className="relative aspect-square flex items-center justify-center p-8">
                                <motion.div
                                    className="relative w-full h-full rounded-full shadow-2xl overflow-hidden border-4 border-white/20"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <img
                                        src={selectedItem.image}
                                        alt={localize(selectedItem, 'name')}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>

                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg z-10"
                                >
                                    <HiXMark className="w-6 h-6 text-gray-600" />
                                </motion.button>
                            </div>

                            {/* Content */}
                            <div className="p-6 text-center">
                                <h2 className="text-3xl font-black text-gray-900 mb-3">
                                    {localize(selectedItem, 'name')}
                                </h2>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {localize(selectedItem, 'description')}
                                </p>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                                        ${parseFloat(getDiscountedPrice(config.promotions || [], selectedItem).finalPrice).toFixed(2)}
                                    </span>
                                </div>

                                {/* Quantity and Add Button */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-2xl p-2 w-fit mx-auto">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-orange-500"
                                        >
                                            <HiMinus className="w-5 h-5" />
                                        </motion.button>
                                        <span className="text-xl font-black text-gray-900 w-8">{modalQuantity}</span>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setModalQuantity(modalQuantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-orange-500"
                                        >
                                            <HiPlus className="w-5 h-5" />
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            handleAddToCart(selectedItem, modalQuantity);
                                            setSelectedItem(null);
                                        }}
                                        className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3"
                                    >
                                        <HiShoppingBag className="w-6 h-6" />
                                        Add {modalQuantity > 1 ? `${modalQuantity} items` : 'to Cart'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Sidebar */}
            <AnimatePresence>
                {isCartOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-orange-400 to-pink-400 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                <HiShoppingBag className="w-7 h-7" />
                                {t('menu.cart')}
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            >
                                <HiXMark className="w-6 h-6 text-white" />
                            </motion.button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-6xl mb-4"
                                    >
                                        🛒
                                    </motion.div>
                                    <p className="font-bold text-gray-400">{t('auth.noOrders')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item, index) => (
                                        <motion.div
                                            key={`${item.id}-${index}`}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="flex gap-3 bg-white rounded-3xl p-3 border-2 border-orange-100 shadow-md"
                                        >
                                            <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-2xl overflow-hidden">
                                                <img src={item.image} alt={localize(item, 'name')} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <h3 className="font-black text-gray-900 text-sm truncate">{localize(item, 'name')}</h3>
                                                    <motion.button
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeFromCart(item.id, item.size)}
                                                        className="text-red-400 hover:text-red-600"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black text-orange-500">${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</span>
                                                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1 border border-gray-100">
                                                        {item.quantity > 1 && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.2 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                            >
                                                                <HiMinus className="w-3 h-3 text-gray-600" />
                                                            </motion.button>
                                                        )}
                                                        <span className="text-xs font-black text-gray-900 w-3 text-center">{item.quantity}</span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                        >
                                                            <HiPlus className="w-3 h-3 text-gray-600" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t-4 border-orange-200 bg-white">
                                {(() => {
                                    const subtotal = getCartTotal();
                                    const { discount: orderDiscount } = calculateOrderDiscount(config.promotions || [], subtotal);
                                    const total = subtotal - orderDiscount + (subtotal * (config.applyTax ? config.taxPercentage / 100 : 0));
                                    return (
                                        <>
                                            <div className="flex justify-between mb-4">
                                                <span className="text-gray-600 font-bold">{t('auth.checkout.total')}</span>
                                                <span className="text-3xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                                                    ${total.toFixed(2)}
                                                </span>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                                                className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2"
                                            >
                                                🎉 {t('auth.checkout.title')}
                                            </motion.button>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-br from-orange-400 to-pink-400 text-white rounded-full shadow-2xl hover:shadow-orange-200 transition-all"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <HiArrowUp className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <PublicMenuSidebarFun
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName={restaurantName}
                displayName={config.restaurantName}
                themeColor={config.themeColor}
                socialMedia={config.socialMedia}
                loyaltyInfo={loyaltyInfo}
            />

            {/* Checkout */}
            <CheckoutFun
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                restaurantName={restaurantName}
                themeColor={config.themeColor}
                promotions={config.promotions || []}
                taxConfig={{ applyTax: config.applyTax || false, taxPercentage: config.taxPercentage || 0 }}
            />

            {/* Loyalty Reward UI */}
            <LoyaltyRewardUI
                restaurantName={restaurantName}
                themeColor={config.themeColor}
                isDarkMode={false}
            />
        </div>
    );
};

export default PublicMenuPizzaFun;
