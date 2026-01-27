
import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiBars3, HiMapPin, HiMagnifyingGlass, HiAdjustmentsHorizontal, HiHome, HiChatBubbleLeftRight, HiBell, HiUserGroup, HiXMark } from 'react-icons/hi2';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar'; // Ensure this component exists or remove if not needed? Pizza1 uses it.
// Pizza1 imports:
import { useClientAuth } from '../context/ClientAuthContext';

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
    const [showAuthSidebar, setShowAuthSidebar] = useState(false); // Added for sidebar

    // Derived state for categories
    const categories = ['All', ...new Set(menuItems.map(i => i.category).filter(Boolean))];

    const { addToCart, cartItems } = useCart();
    // Pizza1 uses useClientAuth for tracker? Not critical for sidebar port but good for consistency.
    // const { user: clientUser } = useClientAuth(); 

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
        // Auto-select first category logic if needed
        if (categories.length > 0 && !categories.includes(activeCategory)) {
            setActiveCategory(categories[0]);
        }
    }, [categories, activeCategory]);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setQuantity(1);
        setIsLiked(false);
    };

    const handleCloseDetail = () => {
        setSelectedItem(null);
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            addToCart({ ...selectedItem, quantity });
            setSelectedItem(null);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-green-500">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-800 relative overflow-hidden" style={{ '--theme-color': config.themeColor }}>
            <style>{`
                .text-theme { color: var(--theme-color) !important; }
                .bg-theme { background-color: var(--theme-color) !important; }
                .border-theme { border-color: var(--theme-color) !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* --- PORTED SIDEBAR (NOW FLOATING BUTTON) --- */}
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={() => setShowAuthSidebar(true)}
                    className="p-3 md:p-4 rounded-[1.2rem] border shadow-md transition-all active:scale-95 flex items-center justify-center bg-white"
                    style={{
                        color: config.themeColor,
                        borderColor: `${config.themeColor}40`,
                    }}
                >
                    <HiBars3 className="w-6 h-6" />
                </button>
            </div>
            {/* --- PORTED SIDEBAR END --- */}

            {/* --- MAIN CONTENT AREA (Existing Layout Wrapped) --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
                <div className="flex-1 overflow-y-auto pb-24">
                    {/* Header */}
                    <div className="px-6 pt-6 flex justify-between items-center pl-24">
                        {/* Hidden mobile menu button since we have sidebar now? Or keep for consistency? */}
                        {/* The Sidebar is visible on mobile in Pizza1 design, so this button is redundant for sidebar toggle.
                             But maybe for "Auth Sidebar" or "Menu"? Pizza1 sidebar button toggles AuthSidebar.
                         */}
                        <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                            <HiMapPin className="w-4 h-4 text-theme" />
                            <span>{config.location || 'Location'}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden">
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">User</div>
                        </div>
                    </div>

                    <div className="px-6 mt-6">
                        <h2 className="text-gray-500 font-medium">Welcome</h2>
                        <h1 className="text-3xl font-bold text-gray-900 mt-1">{config.restaurantName}</h1>
                    </div>

                    {/* Search Bar */}
                    <div className="px-6 mt-6 flex gap-4">
                        <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-3 shadow-sm">
                            <HiMagnifyingGlass className="w-6 h-6 text-gray-400 mr-2" />
                            <input type="text" placeholder="Search Food" className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400" />
                        </div>
                        <button className="w-14 h-14 bg-theme rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200 hover:opacity-90 transition-opacity" style={{ backgroundColor: config.themeColor }}>
                            <HiAdjustmentsHorizontal className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Categories - keeping existing logic */}
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

                    {/* Items Grid */}
                    <div className="px-6 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
                        {menuItems.filter(item => activeCategory === 'All' || item.category === activeCategory).map((item) => (
                            <motion.div
                                key={item.id}
                                layoutId={`item-card-${item.id}`}
                                onClick={() => handleItemClick(item)}
                                className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center relative"
                            >
                                <button className="absolute top-3 right-3 text-red-500 hover:scale-110 transition-transform">
                                    <HiHeart className="w-5 h-5" />
                                </button>
                                <motion.div layoutId={`item-image-${item.id}`} className="w-24 h-24 rounded-full overflow-hidden mb-3 shadow-lg mt-2">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </motion.div>
                                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h3>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1 mb-3">
                                    <span>{item.time}</span>
                                    <span className="flex items-center gap-1 text-yellow-400 font-bold"><span className="text-yellow-400">★</span> {item.rating}</span>
                                </div>
                                <div className="w-full flex items-end justify-between mt-auto">
                                    <span className="text-lg font-bold text-gray-900">${parseFloat(item.price).toFixed(2)}</span>
                                    <button className="w-8 h-8 bg-theme rounded-xl flex items-center justify-center text-white shadow-md hover:opacity-90 transition-opacity" style={{ backgroundColor: config.themeColor }}>
                                        <HiPlus className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md pb-6 pt-4 px-8 flex justify-between items-center z-40 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] text-gray-400">
                    <button className="text-theme" style={{ color: config.themeColor }}><HiHome className="w-7 h-7" /></button>
                    <button className="hover:text-theme transition-colors"><HiChatBubbleLeftRight className="w-6 h-6" /></button>

                    {/* Floating Cart Button */}
                    <div className="relative -top-8">
                        <button className="w-14 h-14 bg-theme rounded-full flex items-center justify-center text-white shadow-xl shadow-green-200 hover:scale-105 transition-transform" style={{ backgroundColor: config.themeColor }} onClick={() => {
                            // Link to checkout or toggle cart
                        }}>
                            <HiShoppingBag className="w-6 h-6" />
                            {cartItems.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                        </button>
                    </div>

                    <button className="hover:text-theme transition-colors"><HiBell className="w-6 h-6" /></button>
                    <button className="hover:text-theme transition-colors"><HiUserGroup className="w-6 h-6" /></button>
                </div>
            </div>

            {/* Screen 2: Details View (Overlay) */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-50 flex flex-col bg-theme"
                        style={{ backgroundColor: config.themeColor }}
                    >
                        {/* Detail Header */}
                        <div className="px-6 pt-6 flex justify-between items-center text-white mb-2">
                            <button onClick={handleCloseDetail} className="p-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
                                <HiArrowLeft className="w-6 h-6" />
                            </button>
                            <span className="font-semibold text-lg">Details food</span>
                            <button onClick={() => setIsLiked(!isLiked)} className="p-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
                                {isLiked ? <HiHeart className="w-6 h-6" /> : <HiOutlineHeart className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Image Section */}
                        <div className="flex-1 flex items-center justify-center p-8 relative">
                            {/* Background decoration */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')] pointer-events-none"></div>

                            <motion.div
                                layoutId={`item-image-${selectedItem.id}`}
                                className="w-64 h-64 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden z-10"
                            >
                                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                            </motion.div>
                        </div>

                        {/* Details Card */}
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
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

                            <div className="flex justify-between items-center mt-6 mb-8 text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-1"><span className="text-yellow-400 text-lg">★</span> {selectedItem.rating}</div>
                                <div className="flex items-center gap-1 text-red-500">🔥 {selectedItem.calories}</div>
                                <div className="flex items-center gap-1 text-orange-400">🕒 {selectedItem.time}</div>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-6">
                                <h3 className="font-bold text-gray-900 mb-2">About food</h3>
                                <div className="text-gray-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedItem.description }} />
                            </div>

                            <button onClick={handleAddToCart} className="w-full bg-theme text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity active:scale-95" style={{ backgroundColor: config.themeColor }}>
                                Add to cart
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PublicMenuSidebar isOpen={showAuthSidebar} onClose={() => setShowAuthSidebar(false)} restaurantName={restaurantName} displayName={config.restaurantName} themeColor={config.themeColor} />
        </div>
    );
};

export default PublicMenuTestemplate;
