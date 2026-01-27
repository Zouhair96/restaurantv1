
import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiBars3, HiMapPin, HiMagnifyingGlass, HiAdjustmentsHorizontal, HiHome, HiChatBubbleLeftRight, HiBell, HiUserGroup, HiXMark } from 'react-icons/hi2';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import Checkout from '../components/menu/Checkout'; // Import Checkout

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
        location: 'Khulna, BD'
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
    const cartControls = useAnimation(); // For vibration effect

    // Derived state for categories
    const categories = ['All', ...new Set(menuItems.map(i => i.category).filter(Boolean))];

    const { addToCart, cartItems } = useCart();

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

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setQuantity(1);
        setIsLiked(false);
    };

    const handleCloseDetail = () => {
        setSelectedItem(null);
    };

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

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-green-500">Loading...</div>;
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
                    onClick={() => setShowAuthSidebar(true)}
                    className="p-3 rounded-[1rem] border shadow-sm active:scale-95 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
                    style={{
                        color: config.themeColor,
                        borderColor: `${config.themeColor}20`,
                    }}
                >
                    <HiBars3 className="w-6 h-6" />
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
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
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
                                placeholder="Search Food"
                                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="px-6 mt-8 flex gap-6 overflow-x-auto no-scrollbar pb-2">
                        {categories.map((cat, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveCategory(cat)}
                                className={`whitespace-nowrap font-medium transition-colors ${activeCategory === cat ? 'text-theme scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                style={activeCategory === cat ? { color: config.themeColor } : {}}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Items Grid with Animation */}
                    <motion.div
                        className="px-5 mt-6 grid grid-cols-2 gap-3 pb-24"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        key={activeCategory}
                    >
                        {menuItems.filter(item =>
                            (activeCategory === 'All' || item.category === activeCategory) &&
                            (item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                layoutId={`item-card-${item.id}`}
                                onClick={() => handleItemClick(item)}
                                className="bg-white rounded-[1.5rem] p-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center relative overflow-hidden group"
                            >
                                <button className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors z-10">
                                    <HiOutlineHeart className="w-5 h-5" />
                                </button>

                                <motion.div layoutId={`item-image-${item.id}`} className="w-28 h-28 rounded-full shadow-lg mt-1 mb-2 group-hover:scale-105 transition-transform duration-300">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-full" />
                                </motion.div>

                                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 w-full truncate px-1">{item.name}</h3>

                                {/* Metadata removed as per user request */}

                                <div className="w-full flex items-center justify-between mt-auto pl-1">
                                    <span className="text-base font-black text-gray-900">${parseFloat(item.price).toFixed(2)}</span>
                                </div>

                                {/* Add Button - Bottom Right Corner */}
                                <button
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-theme flex items-center justify-center text-white rounded-tl-[1.2rem] hover:opacity-90 active:scale-95 transition-all"
                                    style={{ backgroundColor: config.themeColor }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent opening modal
                                        addToCart({ ...item, quantity: 1 });
                                        triggerCartAnimation(item, e);
                                    }}
                                >
                                    <HiPlus className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* --- SCROLL TO TOP BUTTON --- */}
            <AnimatePresence>
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
            </AnimatePresence>

            {/* Screen 2: Details View (Overlay) */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 top-16 z-50 flex flex-col bg-theme overflow-hidden"
                        style={{ backgroundColor: config.themeColor }}
                    >
                        {/* Detail Header - Simplified since main header is visible */}
                        <div className="px-6 pt-4 flex justify-between items-center text-white mb-2">
                            <button onClick={handleCloseDetail} className="p-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
                                <HiArrowLeft className="w-6 h-6" />
                            </button>
                            <span className="font-semibold text-lg">Product Details</span>
                            <button onClick={() => setIsLiked(!isLiked)} className="p-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
                                {isLiked ? <HiHeart className="w-6 h-6" /> : <HiOutlineHeart className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Image Section */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')] pointer-events-none"></div>

                            <div className="relative">
                                {/* Decorative Ring */}
                                <div className="absolute -inset-4 border-2 border-dashed border-white/20 rounded-full animate-[spin_60s_linear_infinite]"></div>

                                <motion.div
                                    layoutId={`item-image-${selectedItem.id}`}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                    className="w-64 h-64 rounded-full border-8 border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden z-10 relative"
                                >
                                    <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
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
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
                                    <span className="text-lg font-bold text-theme" style={{ color: config.themeColor }}>${parseFloat(selectedItem.price).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center bg-theme rounded-full px-1 py-1" style={{ backgroundColor: config.themeColor }}>
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-white"><HiMinus /></button>
                                    <span className="w-6 text-center font-bold text-white">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-white"><HiPlus /></button>
                                </div>
                            </div>

                            {/* Metadata removed as per user request */}

                            <div className="flex-1 overflow-y-auto mb-6">
                                <h3 className="font-bold text-gray-900 mb-2">About food</h3>
                                <div className="text-gray-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedItem.description }} />
                            </div>

                            <button onClick={(e) => handleAddToCart(e)} className="w-full bg-theme text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity active:scale-95" style={{ backgroundColor: config.themeColor }}>
                                Add to cart
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PublicMenuSidebar isOpen={showAuthSidebar} onClose={() => setShowAuthSidebar(false)} restaurantName={restaurantName} displayName={config.restaurantName} themeColor={config.themeColor} />
            <Checkout isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} restaurantName={restaurantName} themeColor={config.themeColor} />

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
        </div>
    );
};

export default PublicMenuTestemplate;
