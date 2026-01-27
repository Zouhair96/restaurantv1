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

    // Cart
    const { addToCart, cartItems } = useCart();
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const { t, localize } = useLanguage();

    // Fetch Data
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

    const categories = ['All', ...new Set(menuItems.map(i => localize(i, 'category')).filter(Boolean))];
    const filteredItems = menuItems.filter(item => activeCategory === 'All' || localize(item, 'category') === activeCategory);

    // Handlers
    const handleItemClick = (item) => {
        setSelectedItem(item);
        setQuantity(1);
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            addToCart({ ...selectedItem, quantity });
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

            <div className="px-6 mt-6">
                <h1 className="text-3xl font-black text-gray-900 leading-tight" dangerouslySetInnerHTML={{ __html: t('auth.menu.differentKind').replace('kind', 'kind <br />') }} />
            </div>

            {/* Search */}
            <div className="px-6 mt-6 flex gap-3">
                <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-3 shadow-sm border border-gray-100">
                    <HiMagnifyingGlass className="w-5 h-5 text-gray-400 mr-2" />
                    <input type="text" placeholder={t('auth.menu.search')} className="w-full bg-transparent outline-none text-sm font-medium" />
                </div>
                <button className="w-12 h-12 bg-theme rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform" style={{ backgroundColor: config.themeColor }}>
                    <HiAdjustmentsHorizontal className="w-6 h-6" />
                </button>
            </div>

            {/* Categories */}
            <div className="mt-8 pl-6 overflow-x-auto no-scrollbar flex gap-4 pr-6 pb-4">
                {categories.map((cat, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all shadow-sm ${activeCategory === cat
                            ? 'bg-theme text-white shadow-lg shadow-orange-200'
                            : 'bg-white text-gray-400 hover:bg-gray-50'
                            }`}
                        style={activeCategory === cat ? { backgroundColor: config.themeColor } : {}}
                    >
                        {cat === 'All' ? t('auth.menu.all') : cat}
                    </button>
                ))}
            </div>

            {/* Popular Items Grid */}
            <div className="px-6 mt-2 pb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{t('auth.menu.all')}</h2>
                    <span className="text-xs font-bold text-theme uppercase tracking-wider cursor-pointer" style={{ color: config.themeColor }}>{t('header.howItWorks')}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {filteredItems.map(item => (
                        <motion.div
                            key={item.id}
                            layoutId={`card-${item.id}`}
                            onClick={() => handleItemClick(item)}
                            className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-shadow cursor-pointer group"
                        >
                            <div className="relative mb-3">
                                <motion.div layoutId={`image-${item.id}`} className="w-full aspect-square rounded-full overflow-hidden shadow-md">
                                    <img src={item.image} alt={localize(item, 'name')} className="w-full h-full object-cover" />
                                </motion.div>
                                <button
                                    onClick={(e) => toggleFavorite(e, item.id)}
                                    className="absolute top-0 right-0 p-1.5 bg-white rounded-full shadow-sm text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <HiHeart className={`w-4 h-4 ${favorites.includes(item.id) ? 'text-red-500 fill-current' : ''}`} />
                                </button>
                            </div>

                            <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{localize(item, 'name')}</h3>
                            <div className="flex items-center gap-2 mt-1 mb-2">
                                <span className="flex items-center text-xs font-bold text-gray-400">
                                    <HiClock className="w-3 h-3 mr-1" /> {item.time}
                                </span>
                                <span className="flex items-center text-xs font-bold text-gray-400">
                                    <HiStar className="w-3 h-3 mr-1 text-yellow-400" /> {item.rating}
                                </span>
                            </div>

                            <div className="flex justify-between items-end">
                                <span className="text-lg font-black text-gray-900">${parseFloat(item.price).toFixed(2)}</span>
                                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-theme hover:text-white transition-colors" style={{ '--tw-hover-bg': config.themeColor }}>
                                    <HiPlus className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

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

                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-2xl font-black text-gray-900">{localize(selectedItem, 'name')}</h2>
                                <span className="text-2xl font-black text-theme" style={{ color: config.themeColor }}>${parseFloat(selectedItem.price).toFixed(2)}</span>
                            </div>

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
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-red-500 transition-colors">
                                        <HiMinus className="w-5 h-5" />
                                    </button>
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
                taxConfig={{ applyTax: config.applyTax, taxPercentage: config.taxPercentage }}
            />
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
